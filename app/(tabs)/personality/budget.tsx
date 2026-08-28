import { Screen } from '@/components/ui/Screen';
import { BudgetSettings } from '@/features/settings/components/BudgetSettings';

export default function BudgetScreen() {
  return (
    <Screen scroll>
      <BudgetSettings />
    </Screen>
  );
}
