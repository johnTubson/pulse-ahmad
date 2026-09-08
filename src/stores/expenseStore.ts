import { create } from 'zustand';

import { ulid } from '@/lib/id';
import { listExpenses, type CreateExpenseInput } from '@/services/supabase/expenses';
import type { Expense } from '@/types/finance';
import { useCategoryStore } from './categoryStore';
import { useOfflineQueue } from './offlineQueue';

/** UI input: slug only; store attaches `categoryRowId` from categoryStore. */
type NewExpense = Omit<CreateExpenseInput, 'id' | 'categoryRowId'>;
type ExpensePatch = Partial<Omit<CreateExpenseInput, 'id' | 'categoryRowId'>>;

function requireCategoryRowId(slug: string): string {
  const categoryRowId = useCategoryStore.getState().rowIdForSlug(slug);
  if (!categoryRowId) {
    throw new Error(`Category "${slug}" is not loaded yet`);
  }
  return categoryRowId;
}

type ExpenseState = {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  add: (userId: string, input: NewExpense) => Expense;
  update: (userId: string, id: string, patch: ExpensePatch) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  isLoading: false,
  error: null,

  load: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await listExpenses(userId);
      set({ expenses, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load expenses',
      });
    }
  },

  add: (userId, input) => {
    const categoryRowId = requireCategoryRowId(input.categoryId);
    const id = ulid();
    const optimistic: Expense = {
      id,
      amount: input.amount,
      categoryId: input.categoryId as Expense['categoryId'],
      note: input.note,
      date: input.date ?? new Date().toISOString(),
      imageUrl: input.imageUrl,
    };

    const payloadInput: CreateExpenseInput = { ...input, id, categoryRowId };

    set((state) => ({ expenses: [optimistic, ...state.expenses] }));
    useOfflineQueue.getState().enqueue({
      entity: 'expense',
      operation: 'create',
      targetId: id,
      payload: { userId, input: payloadInput },
    });

    return optimistic;
  },

  update: (userId, id, patch) => {
    const enriched =
      patch.categoryId !== undefined
        ? { ...patch, categoryRowId: requireCategoryRowId(patch.categoryId) }
        : patch;

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? {
              ...e,
              ...(enriched.amount !== undefined ? { amount: enriched.amount } : {}),
              ...(enriched.categoryId !== undefined
                ? { categoryId: enriched.categoryId as Expense['categoryId'] }
                : {}),
              ...(enriched.note !== undefined ? { note: enriched.note } : {}),
              ...(enriched.date !== undefined ? { date: enriched.date } : {}),
              ...(enriched.imageUrl !== undefined ? { imageUrl: enriched.imageUrl } : {}),
            }
          : e,
      ),
    }));
    useOfflineQueue.getState().enqueue({
      entity: 'expense',
      operation: 'update',
      targetId: id,
      payload: { userId, input: enriched },
    });
  },

  remove: (id) => {
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    useOfflineQueue.getState().enqueue({
      entity: 'expense',
      operation: 'delete',
      targetId: id,
      payload: {},
    });
  },

  reset: () => set({ expenses: [], error: null }),
}));
