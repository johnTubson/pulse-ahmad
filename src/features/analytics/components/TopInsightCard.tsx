import { Text, View } from 'react-native';

import type { TopInsight } from '@/features/analytics/lib/chartData';
import { cn } from '@/utils/cn';

type TopInsightCardProps = {
  insight: TopInsight;
  className?: string;
};

export function TopInsightCard({ insight, className }: TopInsightCardProps) {
  return (
    <View className={cn('rounded-3xl border border-primary/25 bg-primary-50 p-4', className)}>
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary/15">
          <Text className="text-sm">💡</Text>
        </View>
        <Text className="text-sm font-semibold text-text">Top insight</Text>
      </View>

      {insight.unlocked ? (
        <>
          <View className="mb-3 flex-row items-center justify-between px-1">
            <Text className="text-2xl">😔</Text>
            <View className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-primary/20">
              <View className="h-full w-full rounded-full bg-primary" />
            </View>
            <Text className="text-2xl">🍕</Text>
          </View>
          <Text className="text-3xl font-bold text-primary">{insight.multiplierLabel}</Text>
          <Text className="mt-1 text-base font-medium text-text">{insight.body}</Text>
          <View className="mt-3 gap-1.5">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-warning" />
              <Text className="text-sm text-text-muted">{insight.meta[0]}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-secondary" />
              <Text className="text-sm text-text-muted">{insight.meta[1]}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text className="text-sm leading-5 text-text-muted">
          Keep logging expenses with moods — insights unlock once patterns are real, not guessed.
        </Text>
      )}
    </View>
  );
}
