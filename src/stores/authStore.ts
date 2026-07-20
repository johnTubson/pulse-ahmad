import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { env } from '@/constants/env';
import {
  getCurrentSession,
  onAuthStateChange,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from '@/services/supabase/auth';
import { isSupabaseConfigured } from '@/services/supabase/client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthFields = {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
};

export type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type AuthState = AuthFields & {
  error: string | null;
  /** Hydrate the session and subscribe to auth changes. Safe to call again after Fast Refresh. */
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

function sessionToAuthFields(session: Session | null): AuthFields {
  return {
    status: session ? 'authenticated' : 'unauthenticated',
    userId: session?.user.id ?? null,
    email: session?.user.email ?? null,
  };
}

const signedOut: AuthFields = {
  status: 'unauthenticated',
  userId: null,
  email: null,
};

/** Active Supabase auth subscription; cleared before re-init (e.g. Fast Refresh). */
let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => {
  const applyAuthFields = (next: AuthFields) => {
    const { status, userId, email } = get();
    if (status === next.status && userId === next.userId && email === next.email) return;
    set(next);
  };

  const runAuth = async (action: () => Promise<unknown>) => {
    set({ error: null });
    try {
      await action();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
      throw error;
    }
  };

  return {
    status: 'loading',
    userId: null,
    email: null,
    error: null,

    initialize: async () => {
      unsubscribeAuth?.();
      unsubscribeAuth = null;

      if (!isSupabaseConfigured()) {
        applyAuthFields(signedOut);
        return;
      }

      try {
        applyAuthFields(sessionToAuthFields(await getCurrentSession()));
      } catch {
        applyAuthFields(signedOut);
      }

      const { unsubscribe } = onAuthStateChange((session) => {
        applyAuthFields(sessionToAuthFields(session));
      });
      unsubscribeAuth = unsubscribe;
    },

    signIn: (email, password) => runAuth(() => signInService({ email, password })),

    signUp: async (email, password) => {
      set({ error: null });
      try {
        const { session } = await signUpService({ email, password });
        // Apply immediately so AuthRedirect does not wait on the listener.
        if (session) {
          applyAuthFields(sessionToAuthFields(session));
        }
        return { needsEmailConfirmation: session == null };
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        });
        throw error;
      }
    },

    signOut: async () => {
      // Mock mode has no real session — stay signed in as the demo user.
      if (env.useMockData) return;
      await signOutService();
      // onAuthStateChange also applies signed-out; set here so UI updates if the listener lags.
      applyAuthFields(signedOut);
    },
  };
});
