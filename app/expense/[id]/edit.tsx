import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EditExpenseForm } from '@/features/expenses/components/EditExpenseForm';
import { ExpenseNotFound } from '@/features/expenses/components/ExpenseScreenHeader';
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
      <Screen className="bg-surface px-5">
        <Stack.Screen options={{ headerShown: false }} />
        <ExpenseNotFound />
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface px-0">
      <Stack.Screen options={{ headerShown: false }} />
      <EditExpenseForm expense={expense} />
    </Screen>
  );
}
