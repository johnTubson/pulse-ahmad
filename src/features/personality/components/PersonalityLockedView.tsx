import { Text, View } from 'react-native';

import { CircularProgress } from '@/components/ui/CircularProgress';
import { cn } from '@/utils/cn';

type PersonalityLockedViewProps = {
  progress: number;
  daysRemaining: number;
  className?: string;
};

export function PersonalityLockedView({
  progress,
  daysRemaining,
  className,
}: PersonalityLockedViewProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <View className={cn('rounded-3xl border border-border bg-surface px-6 py-10', className)}>
      <View className="items-center">
        <CircularProgress progress={progress} />
        <Text className="mt-6 text-center text-base font-semibold leading-6 text-text">
          You’re {pct}% of the way to discovering your spending personality.
        </Text>
        <Text className="mt-2 text-center text-sm text-text-muted">
          {daysRemaining <= 0
            ? 'Keep logging — unlock is almost here.'
            : `About ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'} of logging`}
        </Text>
      </View>
    </View>
  );
}
