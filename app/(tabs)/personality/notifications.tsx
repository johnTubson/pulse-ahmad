import { Screen } from '@/components/ui/Screen';
import { NotificationsSettings } from '@/features/settings/components/NotificationsSettings';

export default function NotificationsScreen() {
  return (
    <Screen scroll>
      <NotificationsSettings />
    </Screen>
  );
}
