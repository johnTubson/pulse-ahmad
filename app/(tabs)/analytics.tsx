import { router } from 'expo-router';
import { lazy, Suspense, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fab } from '@/components/ui/Fab';
import { PeriodChipRow } from '@/components/ui/PeriodChipRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AnalyticsHeader } from '@/features/analytics/components/AnalyticsHeader';
import { ChartsSegmentFallback } from '@/features/analytics/components/ChartsSegmentFallback';
import { ListSegmentFallback } from '@/features/analytics/components/ListSegmentFallback';
import { moodByExpenseMap } from '@/lib/analytics/moodJoin';
import { resolvePeriodRange, type AnalyticsPeriod } from '@/lib/analytics/period';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import type { CategoryId } from '@/types/finance';

type AnalyticsSegment = 'list' | 'charts';

const SEGMENTS: { id: AnalyticsSegment; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'charts', label: 'Charts' },
];

/**
 * List + charts stay behind async boundaries so the tab's sync require only
 * pulls chrome (header / chips / FAB). On native, first navigation is a
 * synchronous require — keep that graph tiny.
 */
const AnalyticsListSegment = lazy(() =>
  import('@/features/analytics/components/AnalyticsListSegment').then((mod) => ({
    default: mod.AnalyticsListSegment,
  })),
);

const AnalyticsChartsSegment = lazy(() =>
  import('@/features/analytics/components/AnalyticsChartsSegment').then((mod) => ({
    default: mod.AnalyticsChartsSegment,
  })),
);

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const expenses = useExpenseStore((s) => s.expenses);
  const moods = useMoodStore((s) => s.moods);
  const [segment, setSegment] = useState<AnalyticsSegment>('list');
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');

  const range = resolvePeriodRange(period);
  const moodByExpense = moodByExpenseMap(moods);

  const onPressCategory = (categoryId: CategoryId) => {
    router.push(`/analytics/${categoryId}`);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-5 pb-2">
        <AnalyticsHeader
          rangeLabel={range.label}
          onProfilePress={() => router.push('/(tabs)/personality')}
        />

        <SegmentedControl
          options={SEGMENTS}
          value={segment}
          onChange={setSegment}
          className="mb-3"
        />

        <PeriodChipRow value={period} onChange={setPeriod} className="mb-2" />
      </View>

      <View className="min-h-0 flex-1 px-5">
        {segment === 'list' ? (
          <Suspense fallback={<ListSegmentFallback />}>
            <AnalyticsListSegment
              expenses={expenses}
              moodByExpense={moodByExpense}
              period={period}
              range={range}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<ChartsSegmentFallback loadingLabel />}>
            <AnalyticsChartsSegment
              expenses={expenses}
              moods={moods}
              moodByExpense={moodByExpense}
              period={period}
              range={range}
              onPressCategory={onPressCategory}
              onPressPersonality={() => router.push('/(tabs)/personality')}
            />
          </Suspense>
        )}
      </View>

      <Fab onPress={() => router.push('/(tabs)/log')} />
    </View>
  );
}
