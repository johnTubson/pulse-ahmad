import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { useChartWidth } from '@/components/charts/useChartWidth';
import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

export type BarPoint = {
  value: number;
  label: string;
  frontColor?: string;
};

type BarChartCardProps = {
  data: BarPoint[];
  summary?: string;
  className?: string;
};

const CHART_HEIGHT = 150;
const SIDE_GUTTER = 12;
const LABEL_RESERVE = 28;

export function BarChartCard({ data, summary, className }: BarChartCardProps) {
  const { width, onLayout } = useChartWidth();
  const max = Math.max(...data.map((d) => d.value), 1);
  const count = Math.max(data.length, 1);
  const plotWidth = Math.max(width - SIDE_GUTTER * 2, 0);
  /** Split plot into equal slots; bar takes ~55%, gap the rest. */
  const slot = plotWidth > 0 ? plotWidth / count : 40;
  const barWidth = Math.max(16, Math.min(48, slot * 0.55));
  const spacing = Math.max(8, slot - barWidth);

  if (data.length === 0) {
    return (
      <View className={cn('items-center rounded-3xl bg-primary-50 px-4 py-10', className)}>
        <Text className="text-sm text-text-muted">No spending pattern yet</Text>
      </View>
    );
  }

  return (
    <View
      className={cn('overflow-hidden rounded-3xl bg-primary-50 px-2 py-3', className)}
      onLayout={onLayout}
    >
      {width > 0 ? (
        <BarChart
          data={data.map((d) => ({
            value: d.value,
            label: d.label,
            frontColor: d.frontColor ?? (d.value === max ? palette.primary : '#D1D5DB'),
          }))}
          height={CHART_HEIGHT}
          width={plotWidth}
          parentWidth={width}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={SIDE_GUTTER}
          endSpacing={SIDE_GUTTER}
          roundedTop
          hideRules
          hideYAxisText
          yAxisLabelWidth={0}
          yAxisThickness={0}
          yAxisColor="transparent"
          xAxisColor="transparent"
          xAxisThickness={0}
          xAxisLabelTextStyle={{ color: palette.textMuted, fontSize: 10 }}
          labelsExtraHeight={LABEL_RESERVE}
          noOfSections={3}
          maxValue={max * 1.15}
          isAnimated={false}
          disableScroll
        />
      ) : (
        <View style={{ height: CHART_HEIGHT + LABEL_RESERVE }} />
      )}
      {summary ? (
        <Text className="mt-2 px-1 text-center text-sm font-medium text-text">{summary}</Text>
      ) : null}
    </View>
  );
}
