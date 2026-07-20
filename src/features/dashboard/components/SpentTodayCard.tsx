import { Pressable, Text, View } from 'react-native';

import { MoneyText } from '@/components/ui/MoneyText';
import { MOOD_META } from '@/constants/mood';
import type { MoodValue } from '@/types/finance';
import { cn } from '@/utils/cn';

type SpentTodayCardProps = {
  amount: number;
  /** Empty-state label uses "Spent today"; populated uses "Today's spending". */
  variant: 'empty' | 'populated';
  percentDelta?: number | null;
  comparisonLabel?: string | null;
  mood?: MoodValue | null;
  onLogMood?: () => void;
  className?: string;
};

export function SpentTodayCard({
  amount,
  variant,
  percentDelta = null,
  comparisonLabel = null,
  mood = null,
  onLogMood,
  className,
}: SpentTodayCardProps) {
  const showDelta = variant === 'populated' && percentDelta != null;
  const deltaPositive = (percentDelta ?? 0) > 0;
  const deltaZero = percentDelta === 0;

  return (
    <View className={cn('rounded-xl bg-primary-50 p-5', className)}>
      <Text className="text-sm font-medium text-text-muted">
        {variant === 'empty' ? 'Spent today' : "Today's spending"}
      </Text>

      <View className="mt-1 flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <MoneyText amount={amount} size="xl" className="text-text" />
            {showDelta ? (
              <Text
                className={cn(
                  'text-sm font-semibold',
                  deltaZero ? 'text-text-muted' : deltaPositive ? 'text-success' : 'text-error',
                )}
              >
                {deltaZero ? '—' : deltaPositive ? '↑' : '↓'} {Math.abs(percentDelta!)}%
              </Text>
            ) : null}
          </View>
          {variant === 'populated' && comparisonLabel ? (
            <Text className="mt-1 text-sm text-text-muted">{comparisonLabel}</Text>
          ) : null}
        </View>

        {variant === 'empty' && onLogMood ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log mood"
            className="flex-row items-center gap-1.5 rounded-full border border-primary bg-surface px-3.5 py-2 active:opacity-80"
            onPress={onLogMood}
          >
            <Text className="text-sm">🙂</Text>
            <Text className="text-sm font-semibold text-primary">Log mood</Text>
          </Pressable>
        ) : null}

        {variant === 'populated' && mood != null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mood: ${MOOD_META[mood].label}`}
            className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 active:opacity-80"
            onPress={onLogMood}
          >
            <Text className="text-sm">{MOOD_META[mood].emoji}</Text>
            <Text className="text-sm font-medium text-text">{MOOD_META[mood].label}</Text>
          </Pressable>
        ) : null}

        {variant === 'populated' && mood == null && onLogMood ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log mood"
            className="flex-row items-center gap-1.5 rounded-full border border-primary bg-surface px-3.5 py-2 active:opacity-80"
            onPress={onLogMood}
          >
            <Text className="text-sm">🙂</Text>
            <Text className="text-sm font-semibold text-primary">Log mood</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
