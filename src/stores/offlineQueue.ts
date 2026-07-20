import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ulid } from '@/lib/id';
import {
  enqueue,
  hasExceededAttempts,
  incrementAttempts,
  peek,
  remove,
  type NewMutation,
  type QueuedMutation,
} from '@/lib/sync/queue';
import { deleteBudget, upsertBudget } from '@/services/supabase/budgets';
import { createCategory, deactivateCategory, updateCategory } from '@/services/supabase/categories';
import { createExpense, deleteExpense, updateExpense } from '@/services/supabase/expenses';
import { createMood, deleteMood } from '@/services/supabase/moods';
import { updateProfile } from '@/services/supabase/profile';

type OfflineQueueState = {
  queue: QueuedMutation[];
  isOnline: boolean;
  isFlushing: boolean;
  /** Add a mutation (id auto-generated) and flush immediately when online. */
  enqueue: (mutation: Omit<NewMutation, 'id' | 'createdAt'>) => void;
  flush: () => Promise<void>;
  setOnline: (online: boolean) => void;
  pendingCount: () => number;
};

async function processMutation(m: QueuedMutation): Promise<void> {
  const payload = m.payload as Record<string, any>;

  switch (m.entity) {
    case 'expense':
      if (m.operation === 'create') await createExpense(payload.userId, payload.input);
      else if (m.operation === 'update') await updateExpense(m.targetId, payload.input);
      else await deleteExpense(m.targetId);
      return;
    case 'mood':
      if (m.operation === 'create') await createMood(payload.userId, payload.input);
      else await deleteMood(m.targetId);
      return;
    case 'category':
      if (m.operation === 'create') await createCategory(payload.userId, payload.input);
      else if (m.operation === 'update') await updateCategory(m.targetId, payload.input);
      else await deactivateCategory(m.targetId);
      return;
    case 'budget':
      if (m.operation === 'delete') await deleteBudget(m.targetId);
      else await upsertBudget(payload.userId, payload.input);
      return;
    case 'profile':
      await updateProfile(m.targetId, payload.input);
      return;
    default:
      return;
  }
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: true,
      isFlushing: false,

      enqueue: (mutation) => {
        const full: NewMutation = {
          ...mutation,
          id: ulid(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ queue: enqueue(state.queue, full) }));
        if (get().isOnline) void get().flush();
      },

      flush: async () => {
        if (get().isFlushing || !get().isOnline) return;
        set({ isFlushing: true });

        try {
          // Process FIFO; stop on the first transient failure to preserve order.
          for (;;) {
            const next = peek(get().queue);
            if (!next) break;

            try {
              await processMutation(next);
              set((state) => ({ queue: remove(state.queue, next.id) }));
            } catch {
              const bumped = incrementAttempts(get().queue, next.id);
              const current = bumped.find((m) => m.id === next.id);
              if (current && hasExceededAttempts(current)) {
                set({ queue: remove(bumped, next.id) });
                continue; // drop poison mutation, keep draining
              }
              set({ queue: bumped });
              break; // likely offline / transient; retry on next flush
            }
          }
        } finally {
          set({ isFlushing: false });
        }
      },

      setOnline: (online) => {
        const wasOffline = !get().isOnline;
        set({ isOnline: online });
        if (online && wasOffline) void get().flush();
      },

      pendingCount: () => get().queue.length,
    }),
    {
      name: 'pulse-offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);

let netInfoUnsubscribe: (() => void) | null = null;

/** Start listening to connectivity changes. Call once at app startup. */
export function startOfflineQueueListener(): () => void {
  netInfoUnsubscribe?.();
  netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    useOfflineQueue.getState().setOnline(Boolean(state.isConnected));
  });
  return () => {
    netInfoUnsubscribe?.();
    netInfoUnsubscribe = null;
  };
}
