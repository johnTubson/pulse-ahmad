import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type InboxNotification = {
  id: string;
  type: 'budget_alert';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  meta?: { status: 'warning' | 'over'; monthKey: string };
};

type NotificationInboxState = {
  items: InboxNotification[];
  addNotification: (item: Omit<InboxNotification, 'id' | 'read'>) => InboxNotification | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
};

function dedupeKey(item: Pick<InboxNotification, 'type' | 'meta'>): string | null {
  if (item.type === 'budget_alert' && item.meta) {
    return `${item.meta.monthKey}:${item.meta.status}`;
  }
  return null;
}

export const useNotificationInboxStore = create<NotificationInboxState>()(
  persist(
    (set, get) => ({
      items: [],

      addNotification: (item) => {
        const key = dedupeKey(item);
        if (key && get().items.some((existing) => dedupeKey(existing) === key)) {
          return null;
        }

        const created: InboxNotification = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          read: false,
        };

        set((state) => ({ items: [created, ...state.items].slice(0, 100) }));
        return created;
      },

      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),

      markAllRead: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
        })),

      unreadCount: () => get().items.filter((item) => !item.read).length,
    }),
    {
      name: 'pulse-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
