import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { HookContent } from '@/features/onboarding/components/HookContent';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export default function HookScreen() {
  return (
    <Screen className="bg-surface">
      <HookContent
        onContinue={() => {
          useUiStore.getState().completeOnboarding();
          if (useAuthStore.getState().status === 'authenticated') {
            router.replace('/(tabs)');
            return;
          }
          router.push('/(auth)/sign-up');
        }}
      />
    </Screen>
  );
}
