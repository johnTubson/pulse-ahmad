import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useReducer } from 'react';

import { env } from '@/constants/env';
import { MOOD_META } from '@/constants/mood';
import { initialLogFormState, logFormReducer } from '@/features/log/logFormReducer';
import { useReceiptScan } from '@/features/log/useReceiptScan';
import { formatMoney } from '@/lib/currency/formatMoney';
import { ulid } from '@/lib/id';
import { uploadReceipt } from '@/services/supabase/storage';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useScanDraftStore } from '@/stores/scanDraftStore';
import { useUiStore } from '@/stores/uiStore';
import type { CategoryId, MoodValue } from '@/types/finance';

async function resolveImageUrl(
  userId: string,
  receiptUri: string | null,
  onUploadFallback: () => void,
): Promise<string | undefined> {
  if (!receiptUri) return undefined;
  if (env.useMockData) return receiptUri;

  try {
    return await uploadReceipt({
      userId,
      uri: receiptUri,
      fileName: `${ulid()}.jpg`,
      mimeType: 'image/jpeg',
    });
  } catch {
    onUploadFallback();
    return receiptUri;
  }
}

export function useLogForm() {
  const userId = useAuthStore((s) => s.userId);
  const addExpense = useExpenseStore((s) => s.add);
  const addMood = useMoodStore((s) => s.add);
  const showToast = useUiStore((s) => s.showToast);

  const scanToken = useScanDraftStore((s) => s.scanToken);
  const ocrStatus = useScanDraftStore((s) => s.ocrStatus);
  const receiptUri = useScanDraftStore((s) => s.receiptUri);
  const suggestedAmount = useScanDraftStore((s) => s.suggestedAmount);
  const suggestedNote = useScanDraftStore((s) => s.suggestedNote);
  const suggestedDate = useScanDraftStore((s) => s.suggestedDate);
  const clearReceipt = useScanDraftStore((s) => s.clearReceipt);
  const resetScanDraft = useScanDraftStore((s) => s.reset);

  const [state, dispatch] = useReducer(logFormReducer, initialLogFormState);
  const { openCameraScanner, openLibraryScanner } = useReceiptScan(dispatch);

  // Apply each new scan result during render (React-recommended alternative to useEffect).
  if (scanToken !== state.appliedScanToken) {
    dispatch({
      type: 'APPLY_SCAN',
      token: scanToken,
      amount: suggestedAmount,
      note: suggestedNote,
      occurredAt: suggestedDate ? new Date(suggestedDate) : null,
    });
  }

  const parsed = parseFloat(state.amount);
  const canSave = Boolean(userId) && parsed > 0 && state.categoryId != null && !state.saving;
  // Only a successful OCR with an attached receipt locks the Scan control.
  // Failures keep Scan available so the user can retry without removing first.
  const scanned = ocrStatus === 'success' && Boolean(receiptUri);

  const resetForm = () => {
    resetScanDraft();
    dispatch({ type: 'RESET' });
  };

  const save = () => {
    const categoryId = state.categoryId;
    if (!userId || !canSave || categoryId == null) return;
    dispatch({ type: 'SAVE_START' });
    void (async () => {
      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const imageUrl = await resolveImageUrl(userId, receiptUri, () =>
          showToast('Receipt saved locally. Cloud upload will retry later'),
        );
        const expense = addExpense(userId, {
          amount: parsed,
          categoryId,
          note: state.note.trim() || undefined,
          date: state.occurredAt.toISOString(),
          imageUrl,
        });
        dispatch({ type: 'SAVE_SUCCESS', expenseId: expense.id });
      } catch {
        dispatch({ type: 'SAVE_END' });
      }
    })();
  };

  const finish = (mood?: MoodValue) => {
    if (mood && userId && state.savedExpenseId) {
      addMood(userId, mood, state.savedExpenseId);
    }

    const amountLabel = formatMoney(parsed);
    showToast(
      mood ? `Logged ${amountLabel} · Feeling ${MOOD_META[mood].label}` : `Logged ${amountLabel}`,
    );

    dispatch({ type: 'CLOSE_MOOD' });
    resetForm();
    router.navigate('/(tabs)');
  };

  return {
    amount: state.amount,
    categoryId: state.categoryId,
    note: state.note,
    occurredAt: state.occurredAt,
    moodVisible: state.moodVisible,
    scanVisible: state.scanVisible,
    saving: state.saving,
    canSave,
    scanned,
    ocrStatus,
    receiptUri,
    setAmount: (amount: string) => dispatch({ type: 'SET_AMOUNT', amount }),
    setCategoryId: (categoryId: CategoryId) => dispatch({ type: 'SET_CATEGORY', categoryId }),
    setNote: (note: string) => dispatch({ type: 'SET_NOTE', note }),
    setOccurredAt: (occurredAt: Date) => dispatch({ type: 'SET_OCCURRED_AT', occurredAt }),
    openScanSheet: () => dispatch({ type: 'OPEN_SCAN_SHEET' }),
    closeScanSheet: () => dispatch({ type: 'CLOSE_SCAN_SHEET' }),
    clearReceipt,
    openCameraScanner,
    openLibraryScanner,
    save,
    finish,
    goHome: () => router.navigate('/(tabs)'),
  };
}
