import { Screen } from '@/components/ui/Screen';
import { CurrencySettings } from '@/features/settings/components/CurrencySettings';

export default function CurrencyScreen() {
  return (
    <Screen scroll>
      <CurrencySettings />
    </Screen>
  );
}
