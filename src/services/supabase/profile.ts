import type { Profile } from '@/types/finance';
import { getSupabaseClient } from './client';
import { toProfile } from './mappers';

export type UpdateProfileInput = {
  displayName?: string | null;
  currency?: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update({
      display_name: input.displayName,
      currency: input.currency,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return toProfile(data);
}
