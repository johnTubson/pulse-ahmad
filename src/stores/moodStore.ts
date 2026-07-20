import { create } from 'zustand';

import { ulid } from '@/lib/id';
import { listMoods } from '@/services/supabase/moods';
import type { Mood, MoodValue } from '@/types/finance';
import { useOfflineQueue } from './offlineQueue';

type ExpenseState = {
  moods: Mood[];
  isLoading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  add: (userId: string, value: MoodValue, expenseId?: string | null) => Mood;
  remove: (id: string) => void;
  reset: () => void;
};

export const useMoodStore = create<ExpenseState>((set) => ({
  moods: [],
  isLoading: false,
  error: null,

  load: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const moods = await listMoods(userId);
      set({ moods, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load moods',
      });
    }
  },

  add: (userId, value, expenseId = null) => {
    const id = ulid();
    const optimistic: Mood = {
      id,
      value,
      expenseId,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ moods: [optimistic, ...state.moods] }));
    useOfflineQueue.getState().enqueue({
      entity: 'mood',
      operation: 'create',
      targetId: id,
      payload: { userId, input: { id, value, expenseId } },
    });

    return optimistic;
  },

  remove: (id) => {
    set((state) => ({ moods: state.moods.filter((m) => m.id !== id) }));
    useOfflineQueue.getState().enqueue({
      entity: 'mood',
      operation: 'delete',
      targetId: id,
      payload: {},
    });
  },

  reset: () => set({ moods: [], error: null }),
}));
