import { Alert, Share, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { expensesToCsv } from '@/features/settings/lib/exportCsv';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';

export function DataExportSettings() {
  const expenses = useExpenseStore((s) => s.expenses);
  const resetExpenses = useExpenseStore((s) => s.reset);
  const resetMoods = useMoodStore((s) => s.reset);
  const showToast = useUiStore((s) => s.showToast);

  const onExport = async () => {
    if (expenses.length === 0) {
      Alert.alert('Nothing to export', 'Log an expense first, then try again.');
      return;
    }
    const csv = expensesToCsv(expenses);
    try {
      await Share.share({
        message: csv,
        title: 'Pulse expenses.csv',
      });
    } catch {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  const onClear = () => {
    Alert.alert(
      'Clear all data?',
      'This removes expenses and moods from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => {
            resetExpenses();
            resetMoods();
            showToast('Local data cleared');
          },
        },
      ],
    );
  };

  return (
    <View className="gap-4">
      <Text className="text-sm text-text-muted">
        Export {expenses.length} expense{expenses.length === 1 ? '' : 's'} as CSV, or clear local
        data.
      </Text>
      <PrimaryButton label="Export CSV" onPress={() => void onExport()} />
      <SecondaryButton label="Clear all data" onPress={onClear} />
    </View>
  );
}
