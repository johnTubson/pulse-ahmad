import { Pressable, Text, View } from 'react-native';

import { useNotificationInboxStore } from '@/stores/notificationInboxStore';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotificationInbox() {
  const items = useNotificationInboxStore((s) => s.items);
  const markRead = useNotificationInboxStore((s) => s.markRead);
  const markAllRead = useNotificationInboxStore((s) => s.markAllRead);

  if (items.length === 0) {
    return (
      <View className="items-center rounded-3xl bg-grey-100 px-4 py-12">
        <Text className="text-base font-semibold text-text">No notifications yet</Text>
        <Text className="mt-1 text-center text-sm text-text-muted">
          Budget alerts will show up here when you approach or exceed your limit.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mark all notifications as read"
        className="self-end active:opacity-70"
        onPress={markAllRead}
      >
        <Text className="text-sm font-semibold text-primary">Mark all read</Text>
      </Pressable>

      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          className={`rounded-2xl border px-4 py-3.5 active:opacity-80 ${
            item.read ? 'border-border bg-surface' : 'border-primary/30 bg-primary-50'
          }`}
          onPress={() => markRead(item.id)}
        >
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-base font-semibold text-text">{item.title}</Text>
            {!item.read ? <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" /> : null}
          </View>
          <Text className="mt-1 text-sm leading-5 text-text-muted">{item.body}</Text>
          <Text className="mt-2 text-xs text-text-muted">{formatWhen(item.createdAt)}</Text>
        </Pressable>
      ))}
    </View>
  );
}
