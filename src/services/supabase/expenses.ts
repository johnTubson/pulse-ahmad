import type { CategoryId, Expense } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toExpense } from './mappers';

export type CreateExpenseInput = {
  /** Optional client-generated ULID for offline-first stable ids. */
  id?: string;
  amount: number;
  categoryId: CategoryId | string;
  note?: string;
  /** ISO 8601 timestamp; defaults to now when omitted. */
  date?: string;
  imageUrl?: string;
};

export type UpdateExpenseInput = Partial<Omit<CreateExpenseInput, 'date'>> & {
  date?: string;
};

export async function listExpenses(userId: string, limit = 500): Promise<Expense[]> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toExpense);
}

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .insert({
      id: input.id,
      user_id: userId,
      category_id: input.categoryId,
      amount: input.amount,
      note: input.note ?? null,
      expense_date: input.date ?? new Date().toISOString(),
      image_url: input.imageUrl ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toExpense(data);
}

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .update({
      category_id: input.categoryId,
      amount: input.amount,
      note: input.note,
      expense_date: input.date,
      image_url: input.imageUrl,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('expenses').delete().eq('id', id);
  if (error) throw error;
}
