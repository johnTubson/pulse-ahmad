import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { MOOD_META } from '@/constants/mood';
import { AmountDisplay } from '@/features/log/components/AmountDisplay';
import { CategoryGrid } from '@/features/log/components/CategoryGrid';
import { DateTimeRow } from '@/features/log/components/DateTimeRow';
import { LogHeader } from '@/features/log/components/LogHeader';
import { MoodSheet } from '@/features/log/components/MoodSheet';
import { NoteField } from '@/features/log/components/NoteField';
import { ScanSourceSheet } from '@/features/log/components/ScanSourceSheet';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';
import type { CategoryId, MoodValue } from '@/types/finance';

export function LogForm() {
  const userId = useAuthStore((s) => s.userId);
  const addExpense = useExpenseStore((s) => s.add);
  const addMood = useMoodStore((s) => s.add);
  const showToast = useUiStore((s) => s.showToast);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [savedExpenseId, setSavedExpenseId] = useState<string | null>(null);
  const [moodVisible, setMoodVisible] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);

  const parsed = parseFloat(amount);
  const canSave = Boolean(userId) && parsed > 0 && categoryId != null;

  const resetForm = () => {
    setAmount('');
    setNote('');
    setCategoryId(null);
    setOccurredAt(new Date());
    setSavedExpenseId(null);
  };

  const handleSave = () => {
    if (!userId || !canSave || categoryId == null) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const expense = addExpense(userId, {
      amount: parsed,
      categoryId,
      note: note.trim() || undefined,
      date: occurredAt.toISOString(),
    });
    setSavedExpenseId(expense.id);
    setMoodVisible(true);
  };

  const finish = (mood?: MoodValue) => {
    if (mood && userId && savedExpenseId) {
      addMood(userId, mood, savedExpenseId);
    }

    const amountLabel = formatMoney(parsed);
    if (mood) {
      showToast(`Logged ${amountLabel} · Feeling ${MOOD_META[mood].label}`);
    } else {
      showToast(`Logged ${amountLabel}`);
    }

    setMoodVisible(false);
    resetForm();
    router.navigate('/(tabs)');
  };

  const showScanComingSoon = () => {
    setScanVisible(false);
    Alert.alert('Receipt scan', 'Camera OCR lands next — you can keep logging manually for now.');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LogHeader onBack={() => router.navigate('/(tabs)')} onScan={() => setScanVisible(true)} />

        <AmountDisplay value={amount} onChangeText={setAmount} className="mb-6" />

        <CategoryGrid selectedId={categoryId} onSelect={setCategoryId} className="mb-3" />

        <NoteField value={note} onChangeText={setNote} className="mb-3" />

        <DateTimeRow value={occurredAt} onChange={setOccurredAt} className="mb-6" />

        <View className="mt-auto">
          <PrimaryButton label="Save expense" onPress={handleSave} disabled={!canSave} />
        </View>
      </ScrollView>

      <MoodSheet visible={moodVisible} onSelect={(mood) => finish(mood)} onSkip={() => finish()} />

      <ScanSourceSheet
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onScanReceipt={showScanComingSoon}
        onTakePhoto={showScanComingSoon}
        onChooseLibrary={showScanComingSoon}
      />
    </KeyboardAvoidingView>
  );
}
