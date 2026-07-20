import type { AuthStatus } from '@/stores/authStore';

export type AuthSlice = {
  status: AuthStatus;
  userId: string | null;
};

export type SyncDataDeps = {
  onSignedIn: (userId: string) => void;
  onSignedOut: () => void;
};

/** Login / user switch → load; logout (from authenticated) → reset; token refresh → no-op. */
export function syncDataForAuthChange(state: AuthSlice, prev: AuthSlice, deps: SyncDataDeps): void {
  const userId = state.userId;

  if (state.status === 'authenticated' && userId && userId !== prev.userId) {
    deps.onSignedIn(userId);
  } else if (state.status === 'unauthenticated' && prev.status === 'authenticated') {
    deps.onSignedOut();
  }
}
