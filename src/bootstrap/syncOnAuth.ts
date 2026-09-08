import { syncDataForAuthChange, type SyncDataDeps } from '@/lib/sync/authSync';
import { listBudgets } from '@/services/supabase/budgets';
import { getProfile } from '@/services/supabase/profile';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';

let attached = false;

async function hydrateProfileAndBudget(userId: string): Promise<void> {
  const [profileResult, budgetsResult] = await Promise.allSettled([
    getProfile(userId),
    listBudgets(userId),
  ]);

  if (profileResult.status === 'fulfilled' && profileResult.value) {
    const profile = profileResult.value;
    const ui = useUiStore.getState();
    if (profile.displayName) ui.setDisplayName(profile.displayName);
    if (profile.currency) ui.setCurrency(profile.currency);
    ui.completeOnboarding();
  }
  // Rejected: profile may not exist yet for brand-new accounts.

  if (budgetsResult.status === 'fulfilled') {
    const overall = budgetsResult.value.find((b) => b.categoryId == null);
    if (overall) {
      useUiStore.getState().setMonthlyBudget(overall.amountLimit);
    }
  }
  // Rejected: budgets table may be empty or unreachable.
}

const deps: SyncDataDeps = {
  onSignedIn: (userId) => {
    void useCategoryStore.getState().load(userId);
    void useExpenseStore.getState().load(userId);
    void useMoodStore.getState().load(userId);
    void hydrateProfileAndBudget(userId);
  },
  onSignedOut: () => {
    useCategoryStore.getState().reset();
    useExpenseStore.getState().reset();
    useMoodStore.getState().reset();
  },
};

/** Sync expenses, moods, and categories when auth state changes. Runs outside React. */
export function attachSyncOnAuth(): void {
  if (attached) return;
  attached = true;

  useAuthStore.subscribe((state, prev) => {
    syncDataForAuthChange(state, prev, deps);
  });
}
