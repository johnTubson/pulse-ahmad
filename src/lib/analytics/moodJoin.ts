import type { Expense, ExpenseWithMood, Mood, MoodValue } from '@/types/finance';

export function moodByExpenseMap(moods: Mood[]): Map<string, MoodValue> {
  const map = new Map<string, MoodValue>();
  for (const mood of moods) {
    if (mood.expenseId) map.set(mood.expenseId, mood.value);
  }
  return map;
}

export function withMoods(
  expenses: Expense[],
  moodByExpense: Map<string, MoodValue>,
): ExpenseWithMood[] {
  return expenses.map((expense) => ({
    ...expense,
    mood: moodByExpense.get(expense.id) ?? null,
  }));
}
