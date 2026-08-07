import { Screen } from '@/components/ui/Screen';
import { CategoriesSettings } from '@/features/settings/components/CategoriesSettings';

export default function CategoriesScreen() {
  return (
    <Screen scroll>
      <CategoriesSettings />
    </Screen>
  );
}
