import { create } from 'zustand';

import { ulid } from '@/lib/id';
import { listExpenses, type CreateExpenseInput } from '@/services/supabase/expenses';
import type { Expense } from '@/types/finance';
import { useOfflineQueue } from './offlineQueue';

type NewExpense = Omit<CreateExpenseInput, 'id'>;
type ExpensePatch = Partial<Omit<CreateExpenseInput, 'id'>>;

type ExpenseState = {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  add: (userId: string, input: NewExpense) => Expense;
  update: (id: string, patch: ExpensePatch) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useExpenseStore = create<ExpenseState>((set, get) => ({
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
    const id = ulid();
    const optimistic: Expense = {
      id,
      amount: input.amount,
      categoryId: input.categoryId as Expense['categoryId'],
      note: input.note,
      date: input.date ?? new Date().toISOString(),
      imageUrl: input.imageUrl,
    };

    set((state) => ({ expenses: [optimistic, ...state.expenses] }));
    useOfflineQueue.getState().enqueue({
      entity: 'expense',
      operation: 'create',
      targetId: id,
      payload: { userId, input: { ...input, id } },
    });

    return optimistic;
  },

  update: (id, patch) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? {
              ...e,
              ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
              ...(patch.categoryId !== undefined
                ? { categoryId: patch.categoryId as Expense['categoryId'] }
                : {}),
              ...(patch.note !== undefined ? { note: patch.note } : {}),
              ...(patch.date !== undefined ? { date: patch.date } : {}),
              ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
            }
          : e,
      ),
    }));
    useOfflineQueue.getState().enqueue({
      entity: 'expense',
      operation: 'update',
      targetId: id,
      payload: { input: patch },
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
