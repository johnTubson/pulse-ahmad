import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { NotificationBellButton } from '@/components/ui/NotificationBellButton';
import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type AvatarHeaderProps = {
  name: string;
  streakDays: number;
  /** `gear` → Settings · `pencil` → edit name */
  action: 'gear' | 'pencil';
  onActionPress: () => void;
  onNotificationsPress?: () => void;
  className?: string;
};

export function AvatarHeader({
  name,
  streakDays,
  action,
  onActionPress,
  onNotificationsPress,
  className,
}: AvatarHeaderProps) {
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  const streakLabel =
    streakDays <= 0 ? 'Start a streak' : `${streakDays} day${streakDays === 1 ? '' : 's'} streak`;

  return (
    <View className={cn('mt-2 flex-row items-center justify-between gap-3', className)}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
          <Text className="text-lg font-bold text-white">{initial}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-text" numberOfLines={1}>
            {name}
          </Text>
          <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
            {streakDays > 0 ? `🔥 ${streakLabel}` : streakLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {onNotificationsPress ? <NotificationBellButton onPress={onNotificationsPress} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action === 'gear' ? 'Open settings' : 'Edit name'}
          className="h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
          onPress={onActionPress}
        >
          <SymbolView
            name={
              action === 'gear'
                ? { ios: 'gearshape', android: 'settings', web: 'settings' }
                : { ios: 'pencil', android: 'edit', web: 'edit' }
            }
            tintColor={palette.textMuted}
            size={18}
          />
        </Pressable>
      </View>
    </View>
  );
}
