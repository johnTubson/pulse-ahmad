import { ScrollView, Text, View } from 'react-native';

import { TotalSpendCard } from '@/features/analytics/components/TotalSpendCard';
import { ExpenseRow } from '@/features/expenses/components/ExpenseRow';
import {
  daysInRange,
  filterExpensesByRange,
  formatAvgPerDay,
  formatDeltaPercent,
  percentChange,
  periodHeroLabel,
  previousPeriodRange,
  sumExpenses,
  type AnalyticsPeriod,
  type DateRange,
} from '@/lib/analytics/period';
import type { Expense, MoodValue } from '@/types/finance';

type AnalyticsListSegmentProps = {
  expenses: Expense[];
  moodByExpense: Map<string, MoodValue>;
  period: AnalyticsPeriod;
  range: DateRange;
};

export function AnalyticsListSegment({
  expenses,
  moodByExpense,
  period,
  range,
}: AnalyticsListSegmentProps) {
  const inRange = filterExpensesByRange(expenses, range);
  const previous = filterExpensesByRange(expenses, previousPeriodRange(range));
  const total = sumExpenses(inRange);
  const prevTotal = sumExpenses(previous);
  const delta = percentChange(total, prevTotal);
  const dayCount = daysInRange(range);
  const sorted = [...inRange].sort((a, b) => b.date.localeCompare(a.date));

  const vsLabel =
    period === 'week'
      ? 'vs last week'
      : period === 'threeMonth'
        ? 'vs prior 3 mo'
        : 'vs last month';

  return (
    <View className="min-h-0 flex-1">
      <TotalSpendCard
        title={`Total Spend ${periodHeroLabel(period)}`}
        total={total}
        metrics={[
          { label: vsLabel, value: formatDeltaPercent(delta) },
          { label: 'Avg/day', value: formatAvgPerDay(total, dayCount) },
          { label: 'Expenses log', value: String(sorted.length) },
        ]}
        className="mb-4"
      />

      <Text className="mb-2 text-base font-bold text-text">Expenses</Text>

      {sorted.length === 0 ? (
        <View className="items-center rounded-3xl bg-grey-100 px-4 py-10">
          <Text className="text-base font-semibold text-text">No expenses in this period</Text>
          <Text className="mt-1 text-center text-sm text-text-muted">
            Log a few spends to fill this list.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-grey-100"
          contentContainerClassName="pb-24"
          showsVerticalScrollIndicator={false}
        >
          {sorted.map((expense, index) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              mood={moodByExpense.get(expense.id) ?? null}
              showDivider={index < sorted.length - 1}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
