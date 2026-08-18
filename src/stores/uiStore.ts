import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setCurrencyPreference } from '@/lib/currency/currencyPreference';
import type { CategoryId } from '@/types/finance';

type UiState = {
  hasCompletedOnboarding: boolean;
  /** Accelerometer threshold for shake-to-log; higher = harder to trigger. */
  shakeSensitivity: number;
  shakeToLogEnabled: boolean;
  /** ISO 4217 currency code for `formatMoney()`. */
  currency: string;
  /** Optional display name; falls back to email local-part in UI. */
  displayName: string | null;
  dailyReminderEnabled: boolean;
  budgetAlertsEnabled: boolean;
  /** Optional monthly overall budget amount; null = unset. */
  monthlyBudget: number | null;
  /** Category ids hidden from the log grid (still valid on existing expenses). */
  hiddenCategoryIds: CategoryId[];
  toast: string | null;
  /** Transient quick-log overlay opened by shake or settings test. */
  quickLogOpen: boolean;
  completeOnboarding: () => void;
  setShakeSensitivity: (value: number) => void;
  setShakeToLogEnabled: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setDisplayName: (name: string | null) => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setBudgetAlertsEnabled: (enabled: boolean) => void;
  setMonthlyBudget: (amount: number | null) => void;
  toggleHiddenCategory: (id: CategoryId) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  openQuickLog: () => void;
  closeQuickLog: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      shakeSensitivity: 1.7,
      shakeToLogEnabled: true,
      currency: 'USD',
      displayName: null,
      dailyReminderEnabled: false,
      budgetAlertsEnabled: false,
      monthlyBudget: null,
      hiddenCategoryIds: [],
      toast: null,
      quickLogOpen: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setShakeSensitivity: (value) => set({ shakeSensitivity: value }),
      setShakeToLogEnabled: (enabled) => set({ shakeToLogEnabled: enabled }),
      setCurrency: (currency) => {
        setCurrencyPreference(currency);
        set({ currency });
      },
      setDisplayName: (name) => set({ displayName: name }),
      setDailyReminderEnabled: (enabled) => set({ dailyReminderEnabled: enabled }),
      setBudgetAlertsEnabled: (enabled) => set({ budgetAlertsEnabled: enabled }),
      setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),
      toggleHiddenCategory: (id) =>
        set((state) => ({
          hiddenCategoryIds: state.hiddenCategoryIds.includes(id)
            ? state.hiddenCategoryIds.filter((c) => c !== id)
            : [...state.hiddenCategoryIds, id],
        })),
      showToast: (message) => set({ toast: message }),
      dismissToast: () => set({ toast: null }),
      openQuickLog: () => set({ quickLogOpen: true }),
      closeQuickLog: () => set({ quickLogOpen: false }),
    }),
    {
      name: 'pulse-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        shakeSensitivity: state.shakeSensitivity,
        shakeToLogEnabled: state.shakeToLogEnabled,
        currency: state.currency,
        displayName: state.displayName,
        dailyReminderEnabled: state.dailyReminderEnabled,
        budgetAlertsEnabled: state.budgetAlertsEnabled,
        monthlyBudget: state.monthlyBudget,
        hiddenCategoryIds: state.hiddenCategoryIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currency) setCurrencyPreference(state.currency);
      },
    },
  ),
);
