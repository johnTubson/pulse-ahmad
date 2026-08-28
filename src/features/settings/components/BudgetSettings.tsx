import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { env } from '@/constants/env';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useUiStore } from '@/stores/uiStore';

export function BudgetSettings() {
  const userId = useAuthStore((s) => s.userId);
  const monthlyBudget = useUiStore((s) => s.monthlyBudget);
  const setMonthlyBudget = useUiStore((s) => s.setMonthlyBudget);
  const showToast = useUiStore((s) => s.showToast);
  const enqueue = useOfflineQueue((s) => s.enqueue);

  const [budgetDraft, setBudgetDraft] = useState(
    monthlyBudget != null ? String(monthlyBudget) : '',
  );

  const saveBudget = () => {
    const trimmed = budgetDraft.trim();
    if (!trimmed) {
      setMonthlyBudget(null);
      showToast('Monthly budget cleared');
      return;
    }
    const amount = Number(trimmed);
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert('Invalid amount', 'Enter a non-negative number.');
      return;
    }
    setMonthlyBudget(amount);
    if (userId && !env.useMockData) {
      enqueue({
        entity: 'budget',
        operation: 'update',
        targetId: userId,
        payload: { userId, input: { categoryId: null, amountLimit: amount } },
      });
    }
    showToast(`Budget set to ${formatMoney(amount)}`);
  };

  return (
    <View className="gap-4">
      <Text className="text-sm text-text-muted">
        Optional monthly overall limit
        {monthlyBudget != null ? ` · current ${formatMoney(monthlyBudget)}` : ''}.
      </Text>
      <TextInput
        className="rounded-xl bg-grey-100 px-3 py-3 text-base text-text"
        keyboardType="decimal-pad"
        placeholder="e.g. 50000"
        value={budgetDraft}
        onChangeText={setBudgetDraft}
      />
      <PrimaryButton label="Save budget" onPress={saveBudget} />
    </View>
  );
}
