import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { formatMoney } from '@/lib/currency/formatMoney';
import { cn } from '@/utils/cn';

export type DonutSlice = {
  value: number;
  color: string;
  label?: string;
};

type DonutChartCardProps = {
  data: DonutSlice[];
  centerTotal: number;
  centerCaption: string;
  className?: string;
};

export function DonutChartCard({
  data,
  centerTotal,
  centerCaption,
  className,
}: DonutChartCardProps) {
  const slices = data.length > 0 ? data : [{ value: 1, color: '#E5E7EB' }];

  return (
    <View className={cn('items-center py-2', className)}>
      <PieChart
        data={slices}
        donut
        radius={96}
        innerRadius={64}
        innerCircleColor="#FFFFFF"
        isAnimated={false}
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="text-xl font-bold tabular-nums text-text">
              {formatMoney(centerTotal)}
            </Text>
            <Text className="text-xs text-text-muted">{centerCaption}</Text>
          </View>
        )}
      />
    </View>
  );
}
