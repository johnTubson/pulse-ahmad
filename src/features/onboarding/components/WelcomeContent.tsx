import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { IllustrationHero } from '@/features/onboarding/components/IllustrationHero';

type WelcomeContentProps = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function WelcomeContent({ onGetStarted, onSignIn }: WelcomeContentProps) {
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center px-2">
        <IllustrationHero />
        <Text className="mt-8 text-center text-3xl font-bold leading-9 text-text">
          What does money{'\n'}reveal about you
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-text-muted">
          Discover how your emotions shape every purchase you make
        </Text>
      </View>

      <View className="gap-3 pb-2">
        <PrimaryButton label="Get started" onPress={onGetStarted} />
        <SecondaryButton label="Sign in" onPress={onSignIn} />
      </View>
    </View>
  );
}
