import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { categoryColors, categoryLabels } from '@/constants/theme';
import { aggregateByCategory } from '@/lib/analytics/aggregation';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useExpenseStore } from '@/stores/expenseStore';

export default function AnalyticsScreen() {
  const expenses = useExpenseStore((s) => s.expenses);
  const byCategory = aggregateByCategory(expenses);

  return (
    <Screen scroll>
      <Text className="mt-2 text-2xl font-bold text-text">Analytics</Text>
      <Text className="mb-5 mt-1 text-sm text-text-muted">
        Mood and spending charts arrive with the design system. Here is the live category breakdown.
      </Text>

      {byCategory.length === 0 ? (
        <Card className="items-center py-10">
          <Text className="text-4xl">📊</Text>
          <Text className="mt-3 text-base font-semibold text-text">Nothing to analyse yet</Text>
          <Text className="mt-1 text-center text-sm text-text-muted">
            Log a few expenses to see where your money goes.
          </Text>
        </Card>
      ) : (
        byCategory.map((row) => (
          <Card key={row.categoryId} className="mb-2.5">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: categoryColors[row.categoryId] ?? categoryColors.other,
                  }}
                />
                <Text className="text-base font-semibold text-text">
                  {categoryLabels[row.categoryId] ?? 'Other'}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-text">{formatMoney(row.total)}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded bg-border">
              <View
                className="h-full rounded"
                style={{
                  width: `${row.percentage}%`,
                  backgroundColor: categoryColors[row.categoryId] ?? categoryColors.other,
                }}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
