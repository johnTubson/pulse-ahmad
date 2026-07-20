import type { CategoryId, SpendingCategory } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toSpendingCategory } from './mappers';

export type CreateCategoryInput = {
  name: string;
  icon?: CategoryId | string;
  colour?: string;
  sortOrder?: number;
};

export type UpdateCategoryInput = {
  name?: string;
  icon?: CategoryId | string;
  colour?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function listCategories(
  userId: string,
  includeInactive = false,
): Promise<SpendingCategory[]> {
  let query = getSupabaseClient()
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toSpendingCategory);
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<SpendingCategory> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon,
      colour: input.colour,
      sort_order: input.sortOrder,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toSpendingCategory(data);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<SpendingCategory> {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .update({
      name: input.name,
      icon: input.icon,
      colour: input.colour,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toSpendingCategory(data);
}

/** Soft-delete: categories are referenced by expenses, so deactivate instead. */
export async function deactivateCategory(id: string): Promise<SpendingCategory> {
  return updateCategory(id, { isActive: false });
}
