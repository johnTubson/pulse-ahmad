import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type ConfidenceBarProps = {
  daysOfData: number;
  /** 0–1 */
  confidence: number;
  className?: string;
};

export function ConfidenceBar({ daysOfData, confidence, className }: ConfidenceBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, confidence)) * 100);

  return (
    <View className={cn('rounded-2xl bg-pink-50 px-4 py-3', className)}>
      <View className="mb-2 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm text-text">
          Based on {daysOfData} day{daysOfData === 1 ? '' : 's'} of data
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-white">
        <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
