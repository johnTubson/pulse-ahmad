import { router } from 'expo-router';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { palette } from '@/constants/theme';
import {
  DEFAULT_SHAKE_SENSITIVITY,
  DEFAULT_SHAKE_TO_LOG_ENABLED,
  SHAKE_SENSITIVITY_OPTIONS,
} from '@/services/sensors/shakeSensitivity';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { hapticMedium } from '@/utils/haptics';

export function AccountSettings() {
  const signOut = useAuthStore((s) => s.signOut);
  const resetExpenses = useExpenseStore((s) => s.reset);
  const resetMoods = useMoodStore((s) => s.reset);
  const setDisplayName = useUiStore((s) => s.setDisplayName);
  const setMonthlyBudget = useUiStore((s) => s.setMonthlyBudget);
  const setDailyReminderEnabled = useUiStore((s) => s.setDailyReminderEnabled);
  const setBudgetAlertsEnabled = useUiStore((s) => s.setBudgetAlertsEnabled);
  const shakeSensitivity = useUiStore((s) => s.shakeSensitivity);
  const shakeToLogEnabled = useUiStore((s) => s.shakeToLogEnabled);
  const setShakeSensitivity = useUiStore((s) => s.setShakeSensitivity);
  const setShakeToLogEnabled = useUiStore((s) => s.setShakeToLogEnabled);

  const clearLocalAccount = () => {
    resetExpenses();
    resetMoods();
    setDisplayName(null);
    setMonthlyBudget(null);
    setDailyReminderEnabled(false);
    setBudgetAlertsEnabled(false);
    setShakeToLogEnabled(DEFAULT_SHAKE_TO_LOG_ENABLED);
    setShakeSensitivity(DEFAULT_SHAKE_SENSITIVITY);
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

  const testShake = () => {
    hapticMedium();
    router.navigate('/log');
  };

  return (
    <View className="gap-5">
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
            <View className="mb-3 flex-row flex-wrap gap-2">
              {SHAKE_SENSITIVITY_OPTIONS.map((value) => {
                const selected = shakeSensitivity === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={cn(
                      'rounded-full border px-4 py-2',
                      selected ? 'border-primary bg-primary-50' : 'border-border bg-surface',
                    )}
                    style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                    onPress={() => setShakeSensitivity(value)}
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        selected ? 'text-primary' : 'text-text-muted',
                      )}
                    >
                      {value.toFixed(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mb-3 text-sm text-text-muted">
              Opens the log screen so you can feel the flow without shaking.
            </Text>
            <SecondaryButton label="Test shake" onPress={testShake} />
          </View>
        </View>
      </View>

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
