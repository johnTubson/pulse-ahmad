import { generateSeedData, toSpendingCategories } from '@/lib/mock/seedData';
import { useAuthStore } from '@/stores/authStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';

export const MOCK_USER_ID = 'mock-user';
export const MOCK_USER_EMAIL = 'demo@pulse.app';

/**
 * Hydrate auth + expense/mood/category stores with deterministic seed data.
 * Used when `EXPO_PUBLIC_USE_MOCK_DATA=true`. Skips Supabase entirely.
 */
export function loadMockData(): void {
  const data = generateSeedData();

  useAuthStore.setState({
    status: 'authenticated',
    userId: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    error: null,
  });

  useCategoryStore.setState({
    categories: toSpendingCategories(data.categories),
    isLoading: false,
    error: null,
  });

  useExpenseStore.setState({
    expenses: data.expenses,
    isLoading: false,
    error: null,
  });

  useMoodStore.setState({
    moods: data.moods,
    isLoading: false,
    error: null,
  });

  useUiStore.getState().completeOnboarding();
}
