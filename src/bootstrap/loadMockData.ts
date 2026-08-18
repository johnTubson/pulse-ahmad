import { generateSeedData } from '@/lib/mock/seedData';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';

export const MOCK_USER_ID = 'mock-user';
export const MOCK_USER_EMAIL = 'demo@pulse.app';

/**
 * Hydrate auth + expense/mood stores with deterministic seed data.
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
