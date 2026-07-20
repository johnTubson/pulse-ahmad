import type { Mood, MoodValue } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toMood } from './mappers';

export type CreateMoodInput = {
  /** Optional client-generated ULID for offline-first stable ids. */
  id?: string;
  value: MoodValue;
  /** Nullable to support standalone daily check-ins. */
  expenseId?: string | null;
};

export async function listMoods(userId: string, limit = 500): Promise<Mood[]> {
  const { data, error } = await getSupabaseClient()
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toMood);
}

export async function createMood(userId: string, input: CreateMoodInput): Promise<Mood> {
  const { data, error } = await getSupabaseClient()
    .from('moods')
    .insert({
      id: input.id,
      user_id: userId,
      expense_id: input.expenseId ?? null,
      value: input.value,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toMood(data);
}

export async function deleteMood(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('moods').delete().eq('id', id);
  if (error) throw error;
}
