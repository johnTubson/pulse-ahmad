import { syncDataForAuthChange, type AuthSlice, type SyncDataDeps } from '@/lib/sync/authSync';

function makeDeps(): SyncDataDeps & {
  onSignedIn: jest.Mock;
  onSignedOut: jest.Mock;
} {
  return {
    onSignedIn: jest.fn(),
    onSignedOut: jest.fn(),
  };
}

const loading: AuthSlice = { status: 'loading', userId: null };
const signedOut: AuthSlice = { status: 'unauthenticated', userId: null };
const userA: AuthSlice = { status: 'authenticated', userId: 'user-a' };
const userB: AuthSlice = { status: 'authenticated', userId: 'user-b' };

describe('syncDataForAuthChange', () => {
  it('loads expenses and moods when a user signs in', () => {
    const deps = makeDeps();
    syncDataForAuthChange(userA, loading, deps);

    expect(deps.onSignedIn).toHaveBeenCalledWith('user-a');
    expect(deps.onSignedOut).not.toHaveBeenCalled();
  });

  it('loads when signing in from an unauthenticated state', () => {
    const deps = makeDeps();
    syncDataForAuthChange(userA, signedOut, deps);

    expect(deps.onSignedIn).toHaveBeenCalledWith('user-a');
  });

  it('reloads when switching to a different user', () => {
    const deps = makeDeps();
    syncDataForAuthChange(userB, userA, deps);

    expect(deps.onSignedIn).toHaveBeenCalledWith('user-b');
  });

  it('does not reload on token refresh (same userId)', () => {
    const deps = makeDeps();
    syncDataForAuthChange(userA, userA, deps);

    expect(deps.onSignedIn).not.toHaveBeenCalled();
    expect(deps.onSignedOut).not.toHaveBeenCalled();
  });

  it('resets local caches on logout', () => {
    const deps = makeDeps();
    syncDataForAuthChange(signedOut, userA, deps);

    expect(deps.onSignedOut).toHaveBeenCalledTimes(1);
    expect(deps.onSignedIn).not.toHaveBeenCalled();
  });

  it('does not reset when already unauthenticated', () => {
    const deps = makeDeps();
    syncDataForAuthChange(signedOut, signedOut, deps);

    expect(deps.onSignedOut).not.toHaveBeenCalled();
  });

  it('does not reset on cold start to unauthenticated', () => {
    const deps = makeDeps();
    syncDataForAuthChange(signedOut, loading, deps);

    expect(deps.onSignedOut).not.toHaveBeenCalled();
    expect(deps.onSignedIn).not.toHaveBeenCalled();
  });

  it('does not load while still in loading with a null user', () => {
    const deps = makeDeps();
    syncDataForAuthChange(loading, loading, deps);

    expect(deps.onSignedIn).not.toHaveBeenCalled();
  });
});
