import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { SettingsHub } from '@/features/settings/components/SettingsHub';

export default function SettingsScreen() {
  return (
    <Screen scroll>
      <SettingsHub
        onBack={() => router.back()}
        onCurrency={() => router.push('/(tabs)/personality/currency')}
        onCategories={() => router.push('/(tabs)/personality/categories')}
        onNotifications={() => router.push('/(tabs)/personality/notifications')}
        onDataExport={() => router.push('/(tabs)/personality/data-export')}
        onPrivacy={() => router.push('/(tabs)/personality/privacy')}
      />
    </Screen>
  );
}
