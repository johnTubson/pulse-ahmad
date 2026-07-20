import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { HookContent } from '@/features/onboarding/components/HookContent';

export default function HookScreen() {
  return (
    <Screen className="bg-surface">
      <HookContent onContinue={() => router.push('/(auth)/sign-up')} />
    </Screen>
  );
}
