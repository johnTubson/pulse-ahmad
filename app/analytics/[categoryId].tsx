import { router, Stack, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense, useState } from 'react';
import { Text, View } from 'react-native';

import { Fab } from '@/components/ui/Fab';
import { PeriodChipRow } from '@/components/ui/PeriodChipRow';
import { Screen } from '@/components/ui/Screen';
import { MOOD_META } from '@/constants/mood';
import { categoryColors, categoryLabels } from '@/constants/theme';
import { TotalSpendCard } from '@/features/analytics/components/TotalSpendCard';
import { ExpenseRow } from '@/features/expenses/components/ExpenseRow';
import { aggregateByDayOfWeek } from '@/lib/analytics/aggregation';
import { moodByExpenseMap } from '@/lib/analytics/moodJoin';
import {
  daysInRange,
  filterExpensesByRange,
  formatAvgPerDay,
  formatDeltaPercent,
  percentChange,
  previousPeriodRange,
  resolvePeriodRange,
  sumExpenses,
  type AnalyticsPeriod,
} from '@/lib/analytics/period';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import type { CategoryId, MoodValue } from '@/types/finance';

/** Keep gifted-charts off this screen's sync require path. */
const BarChartCard = lazy(() =>
  import('@/components/charts/BarChartCard').then((mod) => ({ default: mod.BarChartCard })),
);

function isCategoryId(value: string): value is CategoryId {
  return value in categoryLabels;
}

function averageMood(values: MoodValue[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default function CategoryDrillScreen() {
  const params = useLocalSearchParams<{ categoryId: string }>();
  const rawId = typeof params.categoryId === 'string' ? params.categoryId : 'other';
  const categoryId: CategoryId = isCategoryId(rawId) ? rawId : 'other';
  const title = categoryLabels[categoryId] ?? 'Other';
  const colour = categoryColors[categoryId] ?? categoryColors.other;

  const expenses = useExpenseStore((s) => s.expenses);
  const moods = useMoodStore((s) => s.moods);
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const range = resolvePeriodRange(period);
  const moodByExpense = moodByExpenseMap(moods);

  const allInRange = filterExpensesByRange(expenses, range);
  const inRange = allInRange.filter((e) => e.categoryId === categoryId);
  const previous = filterExpensesByRange(expenses, previousPeriodRange(range)).filter(
    (e) => e.categoryId === categoryId,
  );
  const total = sumExpenses(inRange);
  const prevTotal = sumExpenses(previous);
  const dayCount = daysInRange(range);
  const byWeekday = aggregateByDayOfWeek(inRange);
  const maxWeekday = Math.max(...byWeekday.map((d) => d.total), 0);
  const topExpenses = [...inRange].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const moodOf = (list: typeof allInRange) =>
    list.map((e) => moodByExpense.get(e.id)).filter((m): m is MoodValue => m != null);
  const categoryMood = averageMood(moodOf(inRange));
  const overallMood = averageMood(moodOf(allInRange));

  const weekdayBars = byWeekday.map((d) => ({
    value: d.total,
    label: d.label.slice(0, 3),
    frontColor: d.total === maxWeekday && maxWeekday > 0 ? colour : '#D1D5DB',
  }));

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title, headerBackTitle: 'Analytics' }} />
      <Screen scroll>
        <PeriodChipRow value={period} onChange={setPeriod} className="mb-4" />

        <TotalSpendCard
          title={`Total Spent · ${title}`}
          total={total}
          metrics={[
            { label: 'vs prior', value: formatDeltaPercent(percentChange(total, prevTotal)) },
            { label: 'Avg/day', value: formatAvgPerDay(total, dayCount) },
            { label: 'Logs', value: String(inRange.length) },
          ]}
          className="mb-5"
        />

        <Text className="mb-2 text-base font-bold text-text">Spending trend</Text>
        <Suspense fallback={<View className="mb-5 h-[180px] rounded-3xl bg-primary-50" />}>
          <BarChartCard className="mb-5" data={weekdayBars} />
        </Suspense>

        <Text className="mb-2 text-base font-bold text-text">Mood comparison</Text>
        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-rose-50 p-4">
            <Text className="text-xs font-medium text-text-muted">This category</Text>
            <Text className="mt-2 text-2xl">
              {categoryMood != null ? MOOD_META[Math.round(categoryMood) as MoodValue]?.emoji : '—'}
            </Text>
            <Text className="mt-1 text-lg font-bold text-text">
              {categoryMood != null ? categoryMood.toFixed(1) : '—'}
            </Text>
          </View>
          <View className="flex-1 rounded-3xl bg-primary-50 p-4">
            <Text className="text-xs font-medium text-text-muted">Overall</Text>
            <Text className="mt-2 text-2xl">
              {overallMood != null ? MOOD_META[Math.round(overallMood) as MoodValue]?.emoji : '—'}
            </Text>
            <Text className="mt-1 text-lg font-bold text-text">
              {overallMood != null ? overallMood.toFixed(1) : '—'}
            </Text>
          </View>
        </View>
        <Text className="mb-5 text-sm text-text-muted">
          {categoryMood != null && overallMood != null
            ? `You average ${categoryMood.toFixed(1)} here vs ${overallMood.toFixed(1)} overall.`
            : 'Tag moods on these expenses to compare how you feel in this category.'}
        </Text>

        <Text className="mb-2 text-base font-bold text-text">Top expenses</Text>
        {topExpenses.length === 0 ? (
          <View className="mb-5 items-center rounded-3xl bg-grey-100 px-4 py-8">
            <Text className="text-sm text-text-muted">No expenses in this category yet</Text>
          </View>
        ) : (
          <View className="mb-5 overflow-hidden rounded-3xl bg-grey-100">
            {topExpenses.map((expense, index) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                mood={moodByExpense.get(expense.id) ?? null}
                showDivider={index < topExpenses.length - 1}
              />
            ))}
          </View>
        )}

        <View className="mb-10 rounded-3xl bg-secondary/10 p-4">
          <Text className="text-base font-bold text-text">Behavior insight</Text>
          <Text className="mt-1 text-sm leading-5 text-text-muted">
            {maxWeekday > 0
              ? `${title} peaks on ${byWeekday.find((d) => d.total === maxWeekday)?.label ?? 'one weekday'}.`
              : 'Keep logging to unlock a category-specific behaviour callout.'}
          </Text>
        </View>
      </Screen>
      <Fab onPress={() => router.push('/(tabs)/log')} />
    </View>
  );
}
