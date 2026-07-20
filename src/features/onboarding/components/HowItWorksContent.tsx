import { View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { HowItWorksSteps } from '@/features/onboarding/components/HowItWorksSteps';

type HowItWorksContentProps = {
  onContinue: () => void;
};

export function HowItWorksContent({ onContinue }: HowItWorksContentProps) {
  return (
    <View className="flex-1">
      <HowItWorksSteps />
      <View className="pb-2">
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}
