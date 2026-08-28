import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { AvatarHeader } from '@/components/ui/AvatarHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SettingsGroup } from '@/components/ui/SettingsGroup';
import { SettingsRow, SignOutRow } from '@/components/ui/SettingsRow';
import { env } from '@/constants/env';
import { palette } from '@/constants/theme';
import { displayHeaderName, firstNameFrom } from '@/features/dashboard/lib/greeting';
import { calculateStreak } from '@/lib/analytics/streaks';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useUiStore } from '@/stores/uiStore';

type SettingsHubProps = {
  onBack: () => void;
  onCurrency: () => void;
  onCategories: () => void;
  onNotifications: () => void;
  onDataExport: () => void;
  onBudget: () => void;
  onAccount: () => void;
};

export function SettingsHub({
  onBack,
  onCurrency,
  onCategories,
  onNotifications,
  onDataExport,
  onBudget,
  onAccount,
}: SettingsHubProps) {
  const userId = useAuthStore((s) => s.userId);
  const email = useAuthStore((s) => s.email);
  const signOut = useAuthStore((s) => s.signOut);
  const displayName = useUiStore((s) => s.displayName);
  const setDisplayName = useUiStore((s) => s.setDisplayName);
  const showToast = useUiStore((s) => s.showToast);
  const enqueue = useOfflineQueue((s) => s.enqueue);
  const expenses = useExpenseStore((s) => s.expenses);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(displayName ?? '');
  const [signingOut, setSigningOut] = useState(false);

  const headerName = displayHeaderName(displayName, email);
  const streak = calculateStreak(expenses.map((e) => e.date));

  const saveName = () => {
    const next = draftName.trim();
    const value = next.length > 0 ? next : null;
    setDisplayName(value);
    setEditingName(false);
    if (userId && !env.useMockData) {
      enqueue({
        entity: 'profile',
        operation: 'update',
        targetId: userId,
        payload: { input: { displayName: value } },
      });
    }
    showToast(value ? 'Display name saved' : 'Display name cleared');
  };

  const onSignOut = () => {
    Alert.alert('Sign out', "You'll need to sign in again to sync your data.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          setSigningOut(true);
          void signOut().finally(() => setSigningOut(false));
        },
      },
    ]);
  };

  return (
    <View className="pb-10">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
        onPress={onBack}
      >
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          tintColor={palette.text}
          size={18}
        />
      </Pressable>

      <AvatarHeader
        name={headerName}
        streakDays={streak.current}
        action="pencil"
        onActionPress={() => {
          setDraftName(displayName ?? firstNameFrom(email));
          setEditingName((open) => !open);
        }}
      />

      {editingName ? (
        <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <Text className="mb-1 text-sm font-medium text-text">Display name</Text>
          <TextInput
            className="rounded-xl bg-grey-100 px-3 py-3 text-base text-text"
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Your name"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={saveName}
          />
          {email ? (
            <Text className="mt-2 text-xs text-text-muted">Email: {email} (read-only)</Text>
          ) : null}
          <PrimaryButton label="Save" onPress={saveName} className="mt-3" />
        </View>
      ) : null}

      <Text className="mb-4 mt-5 text-3xl font-bold text-text">Settings</Text>

      <SettingsGroup className="mb-4">
        <SettingsRow
          label="Currency"
          icon={{ ios: 'dollarsign', android: 'attach_money', web: 'attach_money' }}
          onPress={onCurrency}
        />
        <SettingsRow
          label="Categories"
          icon={{ ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }}
          onPress={onCategories}
        />
        <SettingsRow
          label="Notification"
          icon={{ ios: 'app.badge', android: 'notifications', web: 'notifications' }}
          onPress={onNotifications}
        />
        <SettingsRow
          label="Set budget"
          icon={{ ios: 'chart.pie', android: 'pie_chart', web: 'pie_chart' }}
          onPress={onBudget}
        />
        <SettingsRow
          label="Data export"
          icon={{ ios: 'square.and.arrow.up', android: 'upload', web: 'upload' }}
          onPress={onDataExport}
        />
        <SettingsRow
          label="Account settings"
          icon={{ ios: 'shield', android: 'shield', web: 'shield' }}
          onPress={onAccount}
        />
      </SettingsGroup>

      <SignOutRow onPress={onSignOut} loading={signingOut} />
    </View>
  );
}
