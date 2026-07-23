import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useChartWidth } from '@/components/charts/useChartWidth';
import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

export type LinePoint = {
  value: number;
  label?: string;
};

type LineChartCardProps = {
  data: LinePoint[];
  /** Left edge of the selected date range (secondary x-axis row). */
  rangeStartLabel?: string;
  /** Right edge of the selected date range (secondary x-axis row). */
  rangeEndLabel?: string;
  className?: string;
};

const CHART_HEIGHT = 180;
/** Inset so the line + edge day labels aren’t clipped by overflow-hidden. */
const AXIS_GUTTER = 16;

export function LineChartCard({
  data,
  rangeStartLabel,
  rangeEndLabel,
  className,
}: LineChartCardProps) {
  const { width, onLayout } = useChartWidth();
  const showRangeEnds = Boolean(rangeStartLabel || rangeEndLabel);
  // gifted-charts adds `spacing` once per point (including the last) into
  // totalWidth. Divide by n — not n-1 — so endSpacing stays on-screen.
  const spacing =
    width > 0 && data.length > 0 ? (width - AXIS_GUTTER * 2) / data.length : AXIS_GUTTER;

  if (data.length === 0) {
    return (
      <View className={cn('items-center rounded-3xl bg-rose-50 px-4 py-10', className)}>
        <Text className="text-sm text-text-muted">Not enough mood data yet</Text>
      </View>
    );
  }

  return (
    <View className={cn('overflow-hidden rounded-3xl bg-rose-50 px-3 py-3', className)}>
      <View onLayout={onLayout}>
        {width > 0 ? (
          <>
            <LineChart
              data={data}
              height={CHART_HEIGHT}
              width={width}
              parentWidth={width}
              color={palette.expense}
              thickness={3}
              hideDataPoints
              startFillColor="#FDA4AF"
              endFillColor="#FFF1F2"
              startOpacity={0.35}
              endOpacity={0.05}
              areaChart
              curved
              hideRules
              hideYAxisText
              yAxisLabelWidth={0}
              yAxisThickness={0}
              yAxisColor="transparent"
              xAxisColor="transparent"
              xAxisThickness={0}
              xAxisLabelTextStyle={{ color: palette.textMuted, fontSize: 10 }}
              initialSpacing={AXIS_GUTTER}
              endSpacing={AXIS_GUTTER}
              spacing={spacing}
              maxValue={5}
              isAnimated={false}
              disableScroll
            />
            {showRangeEnds ? (
              <View className="flex-row justify-between" style={{ paddingHorizontal: AXIS_GUTTER }}>
                <Text className="text-[10px] text-text-muted">{rangeStartLabel}</Text>
                <Text className="text-[10px] text-text-muted">{rangeEndLabel}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={{ height: CHART_HEIGHT }} />
        )}
      </View>
    </View>
  );
}
