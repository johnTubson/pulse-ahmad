import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setCurrencyPreference } from '@/lib/currency/currencyPreference';

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
  toast: string | null;
  completeOnboarding: () => void;
  setShakeSensitivity: (value: number) => void;
  setShakeToLogEnabled: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setDisplayName: (name: string | null) => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setBudgetAlertsEnabled: (enabled: boolean) => void;
  setMonthlyBudget: (amount: number | null) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
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
      toast: null,
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
      showToast: (message) => set({ toast: message }),
      dismissToast: () => set({ toast: null }),
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currency) setCurrencyPreference(state.currency);
      },
    },
  ),
);
