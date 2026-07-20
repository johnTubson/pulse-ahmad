import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type InsightProgressCardProps = {
  loggedDays: number;
  required: number;
  className?: string;
};

export function InsightProgressCard({ loggedDays, required, className }: InsightProgressCardProps) {
  const clamped = Math.min(loggedDays, required);
  const progress = required === 0 ? 0 : clamped / required;

  return (
    <View className={cn('rounded-xl bg-pink-50 p-5', className)}>
      <View className="flex-row items-center gap-2">
        <Text className="text-base text-pink-600">✦</Text>
        <Text className="text-base font-bold text-pink-600">Your first insight</Text>
      </View>

      <Text className="mt-3 text-center text-sm leading-5 text-text-muted">
        Keep logging, your first pattern appears after {required} days
      </Text>

      <View className="mt-4 flex-row items-center gap-3">
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-pink-100">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
        <Text className="text-sm font-medium text-text-muted">
          {clamped} of {required}
        </Text>
      </View>
    </View>
  );
}
