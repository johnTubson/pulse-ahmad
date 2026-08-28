import * as FileSystem from 'expo-file-system/legacy';
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
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      Alert.alert('Export failed', 'File storage is unavailable on this device.');
      return;
    }

    const fileName = `pulse-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    const fileUri = `${cacheDir}${fileName}`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Share.share({
        url: fileUri,
        title: fileName,
      });
      showToast('Export ready to share');
    } catch {
      Alert.alert('Export failed', 'Could not create or share the CSV file.');
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
        Export {expenses.length} expense{expenses.length === 1 ? '' : 's'} as a CSV file, or clear
        local data.
      </Text>
      <PrimaryButton label="Export CSV" onPress={() => void onExport()} />
      <SecondaryButton label="Clear all data" onPress={onClear} />
    </View>
  );
}
