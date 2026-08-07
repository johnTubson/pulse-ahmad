import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { LineChartCard } from '@/components/charts/LineChartCard';
import { ScatterChartCard } from '@/components/charts/ScatterChartCard';
import { categoryColors } from '@/constants/theme';
import { CategoryLegend } from '@/features/analytics/components/CategoryLegend';
import { PersonalityLockedCard } from '@/features/analytics/components/PersonalityLockedCard';
import { TopInsightCard } from '@/features/analytics/components/TopInsightCard';
import {
  dailyMoodSeries,
  filterMoodsByRange,
  moodSpendChartCopy,
  spendByTimeOfDay,
  timeOfDaySummary,
  withMoods,
} from '@/features/analytics/lib/chartData';
import { aggregateByCategory } from '@/lib/analytics/aggregation';
import { toDailyMoodSpendPoints } from '@/lib/analytics/correlation';
import {
  filterExpensesByRange,
  periodHeroLabel,
  sumExpenses,
  type AnalyticsPeriod,
  type DateRange,
} from '@/lib/analytics/period';
import { personalityUnlockProgress } from '@/lib/analytics/personality';
import type { CategoryId, Expense, Mood, MoodValue } from '@/types/finance';
import { scheduleIdle } from '@/utils/scheduleIdle';

type AnalyticsChartsSegmentProps = {
  expenses: Expense[];
  moods: Mood[];
  moodByExpense: Map<string, MoodValue>;
  period: AnalyticsPeriod;
  range: DateRange;
  onPressCategory: (categoryId: CategoryId) => void;
  onPressPersonality: () => void;
};

/**
 * Above-the-fold (insight + scatter) paints immediately. Gifted-charts SVG
 * (line / donut / bar) waits for an idle slot so the segment switch stays responsive.
 */
export function AnalyticsChartsSegment({
  expenses,
  moods,
  moodByExpense,
  period,
  range,
  onPressCategory,
  onPressPersonality,
}: AnalyticsChartsSegmentProps) {
  const [svgReady, setSvgReady] = useState(false);

  const inRange = filterExpensesByRange(expenses, range);
  const moodsInRange = filterMoodsByRange(moods, range);
  const tagged = withMoods(inRange, moodByExpense);
  const points = toDailyMoodSpendPoints(tagged);
  const { insight, summary } = moodSpendChartCopy(points);
  const byCategory = aggregateByCategory(inRange);
  const categoryRows = byCategory.map((row) => ({
    categoryId: row.categoryId,
    color: categoryColors[row.categoryId] ?? categoryColors.other,
    total: row.total,
    percentage: row.percentage,
  }));
  const moodLine = dailyMoodSeries(moodsInRange, range);
  const timeBuckets = spendByTimeOfDay(inRange);
  const { progress, daysRemaining } = personalityUnlockProgress(expenses);
  const centerTotal = sumExpenses(inRange);
  const centerCaption = periodHeroLabel(period).replace(/^./, (c) => c.toUpperCase());

  const scheduleSvg = () => {
    if (svgReady) return;
    scheduleIdle(() => setSvgReady(true));
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 pb-28"
      showsVerticalScrollIndicator={false}
      onLayout={scheduleSvg}
    >
      <TopInsightCard insight={insight} />

      <View>
        <Text className="mb-2 text-base font-bold text-text">Mood × Spending</Text>
        <ScatterChartCard data={points} summary={summary} />
      </View>

      <View>
        <Text className="mb-2 text-base font-bold text-text">Mood trend</Text>
        {svgReady ? (
          <LineChartCard
            data={moodLine.points}
            rangeStartLabel={moodLine.rangeStartLabel}
            rangeEndLabel={moodLine.rangeEndLabel}
          />
        ) : (
          <View className="h-[220px] rounded-3xl bg-rose-50" />
        )}
      </View>

      <View>
        <Text className="mb-2 text-base font-bold text-text">Spending overview</Text>
        <View className="rounded-3xl bg-surface px-3 py-2">
          {svgReady ? (
            <DonutChartCard
              data={categoryRows.map((row) => ({ value: row.total, color: row.color }))}
              centerTotal={centerTotal}
              centerCaption={centerCaption}
            />
          ) : (
            <View className="h-52" />
          )}
          <CategoryLegend rows={categoryRows} onPressCategory={onPressCategory} />
        </View>
      </View>

      <View>
        <Text className="mb-2 text-base font-bold text-text">More of you</Text>
        {svgReady ? (
          <BarChartCard data={timeBuckets} summary={timeOfDaySummary(timeBuckets)} />
        ) : (
          <View className="h-44 rounded-3xl bg-primary-50" />
        )}
      </View>

      <PersonalityLockedCard
        progress={progress}
        daysRemaining={daysRemaining}
        onPress={onPressPersonality}
      />
    </ScrollView>
  );
}
