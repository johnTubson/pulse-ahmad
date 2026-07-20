import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type StreakCardProps = {
  current: number;
  subtitle: string;
  className?: string;
};

export function StreakCard({ current, subtitle, className }: StreakCardProps) {
  return (
    <View className={cn('flex-row items-center gap-3 rounded-xl bg-grey-100 p-4', className)}>
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
        <Text className="text-2xl">🔥</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-text">
          {current} day{current === 1 ? '' : 's'} streak
        </Text>
        <Text className="mt-0.5 text-sm text-text-muted">{subtitle}</Text>
      </View>
    </View>
  );
}
