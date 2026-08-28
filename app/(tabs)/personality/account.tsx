import { Screen } from '@/components/ui/Screen';
import { AccountSettings } from '@/features/settings/components/AccountSettings';

export default function AccountScreen() {
  return (
    <Screen scroll>
      <AccountSettings />
    </Screen>
  );
}
