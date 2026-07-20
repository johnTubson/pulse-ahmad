import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { WelcomeContent } from '@/features/onboarding/components/WelcomeContent';

export default function WelcomeScreen() {
  return (
    <Screen className="bg-surface">
      <WelcomeContent
        onGetStarted={() => router.push('/(auth)/how-it-works')}
        onSignIn={() => router.push('/(auth)/sign-in')}
      />
    </Screen>
  );
}
