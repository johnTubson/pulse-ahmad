import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpenseScreenHeader } from '@/features/expenses/components/ExpenseScreenHeader';
import { NotificationInbox } from '@/features/notifications/components/NotificationInbox';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background px-5" style={{ paddingTop: insets.top + 8 }}>
      <ExpenseScreenHeader title="Notifications" onBack={() => router.back()} />
      <NotificationInbox />
    </View>
  );
}
