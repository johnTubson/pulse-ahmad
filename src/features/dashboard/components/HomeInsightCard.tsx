import { Pressable, Text, View } from 'react-native';

import type { HomeInsight } from '@/features/dashboard/lib/homeInsight';
import { cn } from '@/utils/cn';

type HomeInsightCardProps = {
  insight: HomeInsight;
  onSeeEvidence: () => void;
  className?: string;
};

export function HomeInsightCard({ insight, onSeeEvidence, className }: HomeInsightCardProps) {
  return (
    <View className={cn('rounded-xl bg-pink-50 p-5', className)}>
      <View className="flex-row items-center gap-2">
        <Text className="text-base">💡</Text>
        <Text className="text-base font-bold text-pink-600">{insight.headline}</Text>
      </View>

      <Text className="mt-3 text-base font-medium leading-6 text-text">{insight.body}</Text>
      <Text className="mt-2 text-sm text-text-muted">{insight.basis}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="See the evidence"
        className="mt-4 flex-row items-center justify-center gap-1 self-stretch rounded-full border border-primary bg-transparent px-4 py-3 active:opacity-80"
        onPress={onSeeEvidence}
      >
        <Text className="text-sm font-semibold text-primary">See the evidence</Text>
        <Text className="text-sm font-semibold text-primary">→</Text>
      </Pressable>
    </View>
  );
}
