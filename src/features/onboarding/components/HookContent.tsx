import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { InsightCard } from '@/features/onboarding/components/InsightCard';

type HookContentProps = {
  onContinue: () => void;
};

export function HookContent({ onContinue }: HookContentProps) {
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center">
        <InsightCard />
        <Text className="mt-8 px-4 text-center text-base leading-6 text-text-muted">
          This is the kind of pattern Pulse finds in your own spending
        </Text>
      </View>

      <View className="pb-2">
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}
