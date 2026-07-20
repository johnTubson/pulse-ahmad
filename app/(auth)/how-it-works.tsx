import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { HowItWorksContent } from '@/features/onboarding/components/HowItWorksContent';

export default function HowItWorksScreen() {
  return (
    <Screen>
      <HowItWorksContent onContinue={() => router.push('/(auth)/hook')} />
    </Screen>
  );
}
