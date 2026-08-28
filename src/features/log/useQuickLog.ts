import { useReducer } from 'react';

import { MOOD_META } from '@/constants/mood';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';
import type { CategoryId, MoodValue } from '@/types/finance';
import { hapticSuccess } from '@/utils/haptics';

type QuickLogState = {
  amount: string;
  categoryId: CategoryId | null;
  moodVisible: boolean;
  savedExpenseId: string | null;
};

type QuickLogAction =
  | { type: 'SET_AMOUNT'; amount: string }
  | { type: 'SET_CATEGORY'; categoryId: CategoryId }
  | { type: 'SAVE_SUCCESS'; expenseId: string };

const initialQuickLogState: QuickLogState = {
  amount: '',
  categoryId: null,
  moodVisible: false,
  savedExpenseId: null,
};

function quickLogReducer(state: QuickLogState, action: QuickLogAction): QuickLogState {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount };
    case 'SET_CATEGORY':
      return { ...state, categoryId: action.categoryId };
    case 'SAVE_SUCCESS':
      return { ...state, savedExpenseId: action.expenseId, moodVisible: true };
    default:
      return state;
  }
}

export function useQuickLog() {
  const userId = useAuthStore((s) => s.userId);
  const addExpense = useExpenseStore((s) => s.add);
  const addMood = useMoodStore((s) => s.add);
  const showToast = useUiStore((s) => s.showToast);
  const closeQuickLog = useUiStore((s) => s.closeQuickLog);

  const [state, dispatch] = useReducer(quickLogReducer, initialQuickLogState);

  const parsed = parseFloat(state.amount);
  const canSave = Boolean(userId) && parsed > 0 && state.categoryId != null && !state.moodVisible;

  const dismiss = () => {
    if (state.moodVisible) return;
    closeQuickLog();
  };

  const save = () => {
    const categoryId = state.categoryId;
    if (!userId || !canSave || categoryId == null) return;
    hapticSuccess();
    const expense = addExpense(userId, {
      amount: parsed,
      categoryId,
      date: new Date().toISOString(),
    });
    dispatch({ type: 'SAVE_SUCCESS', expenseId: expense.id });
  };

  const finish = (mood?: MoodValue) => {
    if (mood && userId && state.savedExpenseId) {
      addMood(userId, mood, state.savedExpenseId);
    }

    const amountLabel = formatMoney(parsed);
    showToast(
      mood ? `Logged ${amountLabel} · Feeling ${MOOD_META[mood].label}` : `Logged ${amountLabel}`,
    );

    closeQuickLog();
  };

  return {
    amount: state.amount,
    categoryId: state.categoryId,
    moodVisible: state.moodVisible,
    canSave,
    setAmount: (amount: string) => dispatch({ type: 'SET_AMOUNT', amount }),
    setCategoryId: (categoryId: CategoryId) => dispatch({ type: 'SET_CATEGORY', categoryId }),
    save,
    finish,
    dismiss,
  };
}
