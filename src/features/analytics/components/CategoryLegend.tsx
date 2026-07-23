import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { categoryLabels, palette } from '@/constants/theme';
import { formatMoney } from '@/lib/currency/formatMoney';
import type { CategoryId } from '@/types/finance';
import { cn } from '@/utils/cn';

export type LegendRow = {
  categoryId: CategoryId;
  color: string;
  total: number;
  percentage: number;
};

type CategoryLegendProps = {
  rows: LegendRow[];
  onPressCategory: (categoryId: CategoryId) => void;
  className?: string;
};

export function CategoryLegend({ rows, onPressCategory, className }: CategoryLegendProps) {
  if (rows.length === 0) {
    return (
      <Text className={cn('text-center text-sm text-text-muted', className)}>
        No category spend in this period
      </Text>
    );
  }

  return (
    <View className={cn('gap-1', className)}>
      {rows.map((row) => {
        const label = categoryLabels[row.categoryId] ?? 'Other';
        return (
          <Pressable
            key={row.categoryId}
            accessibilityRole="button"
            accessibilityLabel={`Open ${label} details`}
            className="flex-row items-center gap-2 py-2.5"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
            onPress={() => onPressCategory(row.categoryId)}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
              <Text className="flex-1 text-sm font-medium text-text" numberOfLines={1}>
                {label}
              </Text>
            </View>
            <Text className="text-sm tabular-nums text-text-muted">
              {formatMoney(row.total)} ({Math.round(row.percentage)}%)
            </Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={palette.textMuted}
              size={14}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
