import { useState } from 'react';
import { Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { env } from '@/constants/env';
import { palette } from '@/constants/theme';
import { formatMoney } from '@/lib/currency/formatMoney';
import { openQuickLogWithHaptic } from '@/services/sensors/shakeToLog';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useUiStore } from '@/stores/uiStore';

export function PrivacySettings() {
  const userId = useAuthStore((s) => s.userId);
  const signOut = useAuthStore((s) => s.signOut);
  const resetExpenses = useExpenseStore((s) => s.reset);
  const resetMoods = useMoodStore((s) => s.reset);
  const enqueue = useOfflineQueue((s) => s.enqueue);
  const shakeSensitivity = useUiStore((s) => s.shakeSensitivity);
  const shakeToLogEnabled = useUiStore((s) => s.shakeToLogEnabled);
  const monthlyBudget = useUiStore((s) => s.monthlyBudget);
  const setShakeSensitivity = useUiStore((s) => s.setShakeSensitivity);
  const setShakeToLogEnabled = useUiStore((s) => s.setShakeToLogEnabled);
  const setMonthlyBudget = useUiStore((s) => s.setMonthlyBudget);
  const setDisplayName = useUiStore((s) => s.setDisplayName);
  const setDailyReminderEnabled = useUiStore((s) => s.setDailyReminderEnabled);
  const setBudgetAlertsEnabled = useUiStore((s) => s.setBudgetAlertsEnabled);
  const showToast = useUiStore((s) => s.showToast);

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

  const clearLocalAccount = () => {
    resetExpenses();
    resetMoods();
    setDisplayName(null);
    setMonthlyBudget(null);
    setDailyReminderEnabled(false);
    setBudgetAlertsEnabled(false);
    useOfflineQueue.setState({ queue: [] });
    void signOut();
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This signs you out and clears local data on this device. Server-side account deletion is not available from the app yet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: clearLocalAccount,
        },
      ],
    );
  };

  return (
    <View className="gap-5">
      <View>
        <Text className="mb-2 text-base font-bold text-text">Budget</Text>
        <Text className="mb-3 text-sm text-text-muted">
          Optional monthly overall limit
          {monthlyBudget != null ? ` · current ${formatMoney(monthlyBudget)}` : ''}.
        </Text>
        <TextInput
          className="mb-3 rounded-xl bg-grey-100 px-3 py-3 text-base text-text"
          keyboardType="decimal-pad"
          placeholder="e.g. 50000"
          value={budgetDraft}
          onChangeText={setBudgetDraft}
        />
        <PrimaryButton label="Save budget" onPress={saveBudget} />
      </View>

      <View>
        <Text className="mb-2 text-base font-bold text-text">Shake to log</Text>
        <View className="overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="flex-row items-center justify-between px-4 py-4">
            <Text className="flex-1 text-base font-medium text-text">Enable shake</Text>
            <Switch
              value={shakeToLogEnabled}
              onValueChange={setShakeToLogEnabled}
              trackColor={{ true: palette.primary }}
            />
          </View>
          <View className="ml-4 h-px bg-border" />
          <View className="px-4 py-4">
            <Text className="mb-2 text-base font-medium text-text">Sensitivity</Text>
            <Text className="mb-3 text-sm text-text-muted">
              Higher = harder to trigger · {shakeSensitivity.toFixed(1)}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[1.2, 1.7, 2.2, 2.8].map((value) => {
                const selected = Math.abs(shakeSensitivity - value) < 0.05;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full border px-4 py-2 ${
                      selected ? 'border-primary bg-primary-50' : 'border-border bg-surface'
                    }`}
                    onPress={() => setShakeSensitivity(value)}
                  >
                    <Text
                      className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-text'}`}
                    >
                      {value.toFixed(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mb-3 text-sm text-text-muted">
              Opens the quick log overlay so you can feel the flow without shaking.
            </Text>
            <SecondaryButton label="Test shake" onPress={openQuickLogWithHaptic} />
          </View>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-base font-bold text-text">Account</Text>
        <SecondaryButton label="Delete account" onPress={onDeleteAccount} />
      </View>
    </View>
  );
}
