import { Screen } from '@/components/ui/Screen';
import { PrivacySettings } from '@/features/settings/components/PrivacySettings';

export default function PrivacyScreen() {
  return (
    <Screen scroll>
      <PrivacySettings />
    </Screen>
  );
}
