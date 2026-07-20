import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useOfflineQueue } from '@/stores/offlineQueue';

export default function ProfileScreen() {
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const pending = useOfflineQueue((s) => s.queue.length);
  const isOnline = useOfflineQueue((s) => s.isOnline);
  const expenseCount = useExpenseStore((s) => s.expenses.length);
  const [signingOut, setSigningOut] = useState(false);

  const rows = [
    { label: 'Email', value: email ?? 'Not signed in' },
    { label: 'Expenses logged', value: String(expenseCount) },
    { label: 'Connection', value: isOnline ? 'Online' : 'Offline' },
    { label: 'Pending sync', value: pending === 0 ? 'All synced' : `${pending} queued` },
  ];

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen scroll>
      <Text className="mt-2 text-2xl font-bold text-text">Profile</Text>
      <Text className="mb-5 mt-1 text-sm text-text-muted">Account and sync status</Text>

      {rows.map((row) => (
        <Card key={row.label} className="mb-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-medium text-text">{row.label}</Text>
            <Text className="text-sm text-text-muted">{row.value}</Text>
          </View>
        </Card>
      ))}

      <Pressable
        className="mt-6 items-center rounded-xl border border-error py-3.5 active:opacity-70"
        disabled={signingOut}
        onPress={onSignOut}
      >
        {signingOut ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <Text className="text-base font-semibold text-error">Sign out</Text>
        )}
      </Pressable>
    </Screen>
  );
}
