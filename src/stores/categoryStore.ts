import { create } from 'zustand';

import { listCategories } from '@/services/supabase/categories';
import type { SpendingCategory } from '@/types/finance';

type CategoryState = {
  categories: SpendingCategory[];
  isLoading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  rowIdForSlug: (slug: string) => string | undefined;
  hasSlug: (slug: string) => boolean;
  reset: () => void;
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  load: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await listCategories(userId);
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load categories',
      });
    }
  },

  rowIdForSlug: (slug) => get().categories.find((c) => c.slug === slug)?.id,

  hasSlug: (slug) => get().rowIdForSlug(slug) != null,

  reset: () => set({ categories: [], error: null }),
}));
