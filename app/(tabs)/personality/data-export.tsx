import { Screen } from '@/components/ui/Screen';
import { DataExportSettings } from '@/features/settings/components/DataExportSettings';

export default function DataExportScreen() {
  return (
    <Screen scroll>
      <DataExportSettings />
    </Screen>
  );
}
