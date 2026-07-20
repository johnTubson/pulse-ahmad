import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UiState = {
  hasCompletedOnboarding: boolean;
  /** Accelerometer threshold for shake-to-log; higher = harder to trigger. */
  shakeSensitivity: number;
  shakeToLogEnabled: boolean;
  toast: string | null;
  completeOnboarding: () => void;
  setShakeSensitivity: (value: number) => void;
  setShakeToLogEnabled: (enabled: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      shakeSensitivity: 1.7,
      shakeToLogEnabled: true,
      toast: null,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setShakeSensitivity: (value) => set({ shakeSensitivity: value }),
      setShakeToLogEnabled: (enabled) => set({ shakeToLogEnabled: enabled }),
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
      }),
    },
  ),
);
