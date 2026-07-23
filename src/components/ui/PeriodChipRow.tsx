import { Pressable, ScrollView, Text } from 'react-native';

import { ANALYTICS_PERIOD_OPTIONS, type AnalyticsPeriod } from '@/lib/analytics/period';
import { cn } from '@/utils/cn';

type PeriodChipRowProps = {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  className?: string;
};

export function PeriodChipRow({ value, onChange, className }: PeriodChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn('grow-0', className)}
      contentContainerClassName="flex-row gap-2 py-1"
    >
      {ANALYTICS_PERIOD_OPTIONS.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              'rounded-full border px-4 py-2',
              selected ? 'border-primary bg-primary-50' : 'border-border bg-surface',
            )}
            style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
            onPress={() => onChange(option.id)}
          >
            <Text
              className={cn('text-sm font-semibold', selected ? 'text-primary' : 'text-text-muted')}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
