import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function AnalyticsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: palette.primary,
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
