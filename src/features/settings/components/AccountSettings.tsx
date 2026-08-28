import { Alert, Pressable, Text, View } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useUiStore } from '@/stores/uiStore';

export function AccountSettings() {
  const signOut = useAuthStore((s) => s.signOut);
  const resetExpenses = useExpenseStore((s) => s.reset);
  const resetMoods = useMoodStore((s) => s.reset);
  const setDisplayName = useUiStore((s) => s.setDisplayName);
  const setMonthlyBudget = useUiStore((s) => s.setMonthlyBudget);
  const setDailyReminderEnabled = useUiStore((s) => s.setDailyReminderEnabled);
  const setBudgetAlertsEnabled = useUiStore((s) => s.setBudgetAlertsEnabled);

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
        <Text className="mb-2 text-base font-bold text-text">Account</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          className="items-center rounded-2xl border border-error bg-surface px-4 py-3.5 active:opacity-80"
          onPress={onDeleteAccount}
        >
          <Text className="text-base font-semibold text-error">Delete account</Text>
        </Pressable>
      </View>
    </View>
  );
}
