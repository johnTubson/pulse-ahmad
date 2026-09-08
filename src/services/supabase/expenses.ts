import type { CategoryId, Expense } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toExpenseFromJoin, type ExpenseRowWithCategory } from './mappers';

const EXPENSE_SELECT = '*, categories ( slug )' as const;

export type CreateExpenseInput = {
  /** Optional client-generated ULID for offline-first stable ids. */
  id?: string;
  amount: number;
  /** App category slug (domain / optimistic UI). */
  categoryId: CategoryId | string;
  /** `categories.id` ULID for the FK insert. */
  categoryRowId: string;
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
    .select(EXPENSE_SELECT)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as ExpenseRowWithCategory[]).map(toExpenseFromJoin);
}

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .insert({
      id: input.id,
      user_id: userId,
      category_id: input.categoryRowId,
      amount: input.amount,
      note: input.note ?? null,
      expense_date: input.date ?? new Date().toISOString(),
      image_url: input.imageUrl ?? null,
    })
    .select(EXPENSE_SELECT)
    .single();

  if (error) throw error;
  return toExpenseFromJoin(data as ExpenseRowWithCategory);
}

export async function updateExpense(
  userId: string,
  id: string,
  input: UpdateExpenseInput,
): Promise<Expense> {
  if (input.categoryId !== undefined && input.categoryRowId == null) {
    throw new Error('categoryRowId is required when updating categoryId');
  }

  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .update({
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
      ...(input.date !== undefined ? { expense_date: input.date } : {}),
      ...(input.imageUrl !== undefined ? { image_url: input.imageUrl } : {}),
      ...(input.categoryRowId !== undefined ? { category_id: input.categoryRowId } : {}),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(EXPENSE_SELECT)
    .single();

  if (error) throw error;
  return toExpenseFromJoin(data as ExpenseRowWithCategory);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('expenses').delete().eq('id', id);
  if (error) throw error;
}
