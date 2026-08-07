import type { Expense } from '@/types/finance';

export function expensesToCsv(expenses: Expense[]): string {
  const header = 'id,date,amount,categoryId,note,imageUrl';
  const rows = expenses.map((expense) => {
    const note = (expense.note ?? '').replace(/"/g, '""');
    return [
      expense.id,
      expense.date,
      expense.amount,
      expense.categoryId,
      `"${note}"`,
      expense.imageUrl ?? '',
    ].join(',');
  });
  return [header, ...rows].join('\n');
}
