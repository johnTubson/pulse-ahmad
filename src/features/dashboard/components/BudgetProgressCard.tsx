import { Text, View } from 'react-native';

import { MoneyText } from '@/components/ui/MoneyText';
import type { BudgetProgress } from '@/lib/budget/calculator';
import { cn } from '@/utils/cn';

type BudgetProgressCardProps = {
  progress: BudgetProgress;
  alertMessage?: string | null;
  className?: string;
};

const STATUS_BAR: Record<BudgetProgress['status'], string> = {
  under: 'bg-success',
  warning: 'bg-warning',
  over: 'bg-error',
};

export function BudgetProgressCard({
  progress,
  alertMessage = null,
  className,
}: BudgetProgressCardProps) {
  const fill = Math.min(100, Math.max(0, progress.percentage));

  return (
    <View className={cn('rounded-xl bg-grey-100 p-5', className)}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-medium text-text-muted">Monthly budget</Text>
        <Text className="text-sm font-semibold text-text">{progress.percentage}%</Text>
      </View>

      <View className="mt-3 h-2 overflow-hidden rounded-full bg-border">
        <View
          className={cn('h-full rounded-full', STATUS_BAR[progress.status])}
          style={{ width: `${fill}%` }}
        />
      </View>

      <View className="mt-3 flex-row items-end justify-between gap-3">
        <View>
          <Text className="text-xs text-text-muted">Spent</Text>
          <MoneyText amount={progress.spent} size="md" className="text-text" />
        </View>
        <View className="items-end">
          <Text className="text-xs text-text-muted">
            {progress.remaining >= 0 ? 'Remaining' : 'Over by'}
          </Text>
          <MoneyText
            amount={Math.abs(progress.remaining)}
            size="md"
            className={progress.remaining >= 0 ? 'text-text' : 'text-error'}
          />
        </View>
      </View>

      {alertMessage ? <Text className="mt-3 text-sm text-text-muted">{alertMessage}</Text> : null}
    </View>
  );
}
