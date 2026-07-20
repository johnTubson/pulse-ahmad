import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type InsightCardProps = {
  quote?: string;
  className?: string;
};

const DEFAULT_QUOTE = 'I spend twice as much on food delivery when I\u2019m stressed.';

export function InsightCard({ quote = DEFAULT_QUOTE, className }: InsightCardProps) {
  return (
    <View className={cn('w-full items-center rounded-3xl bg-pink-50 px-6 py-10', className)}>
      <Text className="text-center text-xl font-bold leading-7 text-pink-600">
        {'\u201C'}
        {quote}
        {'\u201D'}
      </Text>
      <View className="mt-6 h-1 w-12 rounded-full bg-pink-600" />
    </View>
  );
}
