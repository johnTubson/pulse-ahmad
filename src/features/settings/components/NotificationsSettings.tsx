import { Switch, Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { useUiStore } from '@/stores/uiStore';

export function NotificationsSettings() {
  const dailyReminderEnabled = useUiStore((s) => s.dailyReminderEnabled);
  const budgetAlertsEnabled = useUiStore((s) => s.budgetAlertsEnabled);
  const setDailyReminderEnabled = useUiStore((s) => s.setDailyReminderEnabled);
  const setBudgetAlertsEnabled = useUiStore((s) => s.setBudgetAlertsEnabled);

  return (
    <View className="gap-3">
      <Text className="text-sm text-text-muted">
        Daily reminder schedules a local notification at 8:00 pm. Budget alerts appear on Home when
        you are near or over your monthly limit.
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="mr-3 flex-1">
            <Text className="text-base font-medium text-text">Daily logging reminder</Text>
            <Text className="mt-0.5 text-sm text-text-muted">
              A nudge to keep your streak alive
            </Text>
          </View>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={setDailyReminderEnabled}
            trackColor={{ true: palette.primary }}
          />
        </View>
        <View className="ml-4 h-px bg-border" />
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="mr-3 flex-1">
            <Text className="text-base font-medium text-text">Budget alerts</Text>
            <Text className="mt-0.5 text-sm text-text-muted">When you are approaching a limit</Text>
          </View>
          <Switch
            value={budgetAlertsEnabled}
            onValueChange={setBudgetAlertsEnabled}
            trackColor={{ true: palette.primary }}
          />
        </View>
      </View>
    </View>
  );
}
