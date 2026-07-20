import { View } from 'react-native';

import { OnboardingStepItem } from '@/features/onboarding/components/OnboardingStepItem';

function ReceiptGlyph() {
  return (
    <View className="h-9 w-7 items-center rounded-sm border-2 border-white px-1 py-1.5">
      <View className="mb-1 h-0.5 w-full rounded-full bg-white" />
      <View className="mb-1 h-0.5 w-full rounded-full bg-white opacity-80" />
      <View className="h-0.5 w-3/4 rounded-full bg-white opacity-60" />
    </View>
  );
}

function MoodGlyph() {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white">
      <View className="mb-1 flex-row gap-2">
        <View className="h-1.5 w-1.5 rounded-full bg-white" />
        <View className="h-1.5 w-1.5 rounded-full bg-white" />
      </View>
      <View className="mt-0.5 h-2 w-4 rounded-b-full border-b-2 border-white" />
    </View>
  );
}

function PatternsGlyph() {
  return (
    <View className="h-9 w-9 items-center justify-center">
      <View className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white" />
      <View className="absolute bottom-1 right-0.5 h-2.5 w-2.5 rounded-full bg-white" />
      <View className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white opacity-90" />
    </View>
  );
}

export function HowItWorksSteps() {
  return (
    <View className="flex-1 items-center justify-center py-6">
      <OnboardingStepItem label="Log an expense" tone="orange" showConnector>
        <ReceiptGlyph />
      </OnboardingStepItem>
      <OnboardingStepItem label="Tag your mood" tone="purple" showConnector>
        <MoodGlyph />
      </OnboardingStepItem>
      <OnboardingStepItem label="Discover your patterns" tone="pink">
        <PatternsGlyph />
      </OnboardingStepItem>
    </View>
  );
}
