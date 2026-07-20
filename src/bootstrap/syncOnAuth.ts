import { syncDataForAuthChange, type SyncDataDeps } from '@/lib/sync/authSync';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';

let attached = false;

const deps: SyncDataDeps = {
  onSignedIn: (userId) => {
    void useExpenseStore.getState().load(userId);
    void useMoodStore.getState().load(userId);
  },
  onSignedOut: () => {
    useExpenseStore.getState().reset();
    useMoodStore.getState().reset();
  },
};

/** Sync expenses and moods when auth state changes. Runs outside React. */
export function attachSyncOnAuth(): void {
  if (attached) return;
  attached = true;

  useAuthStore.subscribe((state, prev) => {
    syncDataForAuthChange(state, prev, deps);
  });
}
