import { Text, View } from 'react-native';

import { ProfileMenuPill } from '@/components/ui/ProfileMenuPill';
import { cn } from '@/utils/cn';

type AnalyticsHeaderProps = {
  rangeLabel: string;
  onProfilePress: () => void;
  className?: string;
};

export function AnalyticsHeader({ rangeLabel, onProfilePress, className }: AnalyticsHeaderProps) {
  return (
    <View className={cn('mb-3', className)}>
      <Text className="text-center text-xs font-medium text-text-muted">{rangeLabel}</Text>
      <View className="mt-1 flex-row items-center justify-between">
        <View className="w-11" />
        <Text className="text-xl font-bold text-text">Analytics</Text>
        <ProfileMenuPill onPress={onProfilePress} />
      </View>
    </View>
  );
}
