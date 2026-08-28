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
  vsPriorLabel,
  type AnalyticsPeriod,
  type DateRange,
} from '@/lib/analytics/period';
import type { Expense, MoodValue } from '@/types/finance';

type AnalyticsListSegmentProps = {
  expenses: Expense[];
  moodByExpense: Map<string, MoodValue>;
  period: AnalyticsPeriod;
  range: DateRange;
  onExpensePress: (expenseId: string) => void;
};

export function AnalyticsListSegment({
  expenses,
  moodByExpense,
  period,
  range,
  onExpensePress,
}: AnalyticsListSegmentProps) {
  const inRange = filterExpensesByRange(expenses, range);
  const previousRange = previousPeriodRange(range, period);
  const previous = previousRange ? filterExpensesByRange(expenses, previousRange) : [];
  const total = sumExpenses(inRange);
  const prevTotal = sumExpenses(previous);
  const delta = percentChange(total, prevTotal);
  const dayCount = daysInRange(range);
  const sorted = [...inRange].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View className="min-h-0 flex-1">
      <TotalSpendCard
        title={`Total Spend ${periodHeroLabel(period)}`}
        total={total}
        metrics={[
          ...(previousRange
            ? [{ label: vsPriorLabel(period), value: formatDeltaPercent(delta) }]
            : []),
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
              onPress={() => onExpensePress(expense.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
