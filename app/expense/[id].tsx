import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { palette } from '@/constants/theme';
import { EditExpenseForm } from '@/features/expenses/components/EditExpenseForm';
import { useExpenseStore } from '@/stores/expenseStore';

export default function ExpenseEditScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const expense = useExpenseStore((s) => s.expenses.find((e) => e.id === id));

  if (!id) {
    return <Redirect href="/(tabs)" />;
  }

  if (!expense) {
    return (
      <Screen className="bg-surface">
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
          onPress={() => router.back()}
        >
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            tintColor={palette.text}
            size={18}
          />
        </Pressable>
        <Text className="text-xl font-bold text-text">Expense not found</Text>
        <Text className="mt-2 text-sm text-text-muted">It may have already been deleted.</Text>
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface px-0">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
          onPress={() => router.back()}
        >
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            tintColor={palette.text}
            size={18}
          />
        </Pressable>
      </View>
      <EditExpenseForm expense={expense} />
    </Screen>
  );
}
