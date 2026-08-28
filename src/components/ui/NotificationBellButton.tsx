import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { palette } from '@/constants/theme';
import { useNotificationInboxStore } from '@/stores/notificationInboxStore';

type NotificationBellButtonProps = {
  onPress: () => void;
  className?: string;
};

export function NotificationBellButton({ onPress, className }: NotificationBellButtonProps) {
  const unread = useNotificationInboxStore((s) => s.unreadCount());

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      className={`relative h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70 ${className ?? ''}`}
      onPress={onPress}
    >
      <SymbolView
        name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
        tintColor={palette.textMuted}
        size={18}
      />
      {unread > 0 ? (
        <View className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-surface bg-primary" />
      ) : null}
    </Pressable>
  );
}
