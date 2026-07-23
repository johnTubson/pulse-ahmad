import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type PersonalityLockedCardProps = {
  progress: number;
  daysRemaining: number;
  className?: string;
};

export function PersonalityLockedCard({
  progress,
  daysRemaining,
  className,
}: PersonalityLockedCardProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <View className={cn('rounded-3xl border border-secondary/20 bg-secondary/10 p-4', className)}>
      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-base">🔒</Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Unlocking soon
        </Text>
      </View>
      <Text className="text-lg font-bold text-text">Spending Personality</Text>
      <Text className="mt-1 text-sm leading-5 text-text-muted">
        Your emotional archetype and the hidden patterns behind every purchase.
      </Text>
      <View className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
        <View className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          {daysRemaining <= 0
            ? 'Ready to unlock'
            : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} of data remaining`}
        </Text>
        <Text className="text-xs font-semibold text-text">{pct}%</Text>
      </View>
    </View>
  );
}
