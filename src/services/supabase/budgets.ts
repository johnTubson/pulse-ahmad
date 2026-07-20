import type { MonthlyBudget } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toMonthlyBudget } from './mappers';

export type UpsertBudgetInput = {
  /** null = overall monthly budget. */
  categoryId?: string | null;
  amountLimit: number;
};

export async function listBudgets(userId: string): Promise<MonthlyBudget[]> {
  const { data, error } = await getSupabaseClient()
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(toMonthlyBudget);
}

export async function upsertBudget(
  userId: string,
  input: UpsertBudgetInput,
): Promise<MonthlyBudget> {
  const { data, error } = await getSupabaseClient()
    .from('budgets')
    .upsert(
      {
        user_id: userId,
        category_id: input.categoryId ?? null,
        amount_limit: input.amountLimit,
        period: 'monthly',
      },
      { onConflict: 'user_id,category_id,period' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return toMonthlyBudget(data);
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('budgets').delete().eq('id', id);
  if (error) throw error;
}
