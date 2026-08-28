import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function PersonalityStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: palette.primary,
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="currency" options={{ title: 'Currency' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notification' }} />
      <Stack.Screen name="data-export" options={{ title: 'Data export' }} />
      <Stack.Screen name="budget" options={{ title: 'Set budget' }} />
      <Stack.Screen name="account" options={{ title: 'Account settings' }} />
    </Stack>
  );
}
