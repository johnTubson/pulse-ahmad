import { Text, View } from 'react-native';

import { MoneyText } from '@/components/ui/MoneyText';
import { cn } from '@/utils/cn';

type MetricTile = {
  label: string;
  value: string;
};

type TotalSpendCardProps = {
  title: string;
  total: number;
  metrics: [MetricTile, MetricTile, MetricTile];
  className?: string;
};

export function TotalSpendCard({ title, total, metrics, className }: TotalSpendCardProps) {
  return (
    <View className={cn('rounded-3xl border border-primary/30 bg-primary-50 p-4', className)}>
      <Text className="text-sm font-medium text-text-muted">{title}</Text>
      <MoneyText amount={total} size="xl" className="mt-1 text-text" />

      <View className="mt-4 flex-row gap-2">
        {metrics.map((metric) => (
          <View key={metric.label} className="min-w-0 flex-1 rounded-2xl bg-surface px-2.5 py-3">
            <Text className="text-[11px] font-medium text-text-muted" numberOfLines={1}>
              {metric.label}
            </Text>
            <Text className="mt-1 text-base font-bold tabular-nums text-text" numberOfLines={1}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
