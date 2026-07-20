import type { Session, Subscription, User } from '@supabase/supabase-js';

import { getSupabaseClient } from './client';

export type Credentials = {
  email: string;
  password: string;
};

export async function signUp({ email, password }: Credentials): Promise<{
  user: User | null;
  session: Session | null;
}> {
  const { data, error } = await getSupabaseClient().auth.signUp({ email, password });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signIn({ email, password }: Credentials): Promise<Session> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Subscribe to auth changes (sign in/out, token refresh). Returns an unsubscribe handle. */
export function onAuthStateChange(callback: (session: Session | null) => void): {
  unsubscribe: () => void;
} {
  const {
    data: { subscription },
  }: { data: { subscription: Subscription } } = getSupabaseClient().auth.onAuthStateChange(
    (_event, session) => callback(session),
  );
  return { unsubscribe: () => subscription.unsubscribe() };
}
