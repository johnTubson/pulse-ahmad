import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type StepTone = 'orange' | 'purple' | 'pink';

const toneClass: Record<StepTone, string> = {
  orange: 'bg-orange-400',
  purple: 'bg-secondary-400',
  pink: 'bg-pink-300',
};

type OnboardingStepItemProps = PropsWithChildren<{
  label: string;
  tone: StepTone;
  showConnector?: boolean;
}>;

export function OnboardingStepItem({
  label,
  tone,
  showConnector = false,
  children,
}: OnboardingStepItemProps) {
  return (
    <View className="items-center">
      <View
        className={cn('h-20 w-20 items-center justify-center rounded-full', toneClass[tone])}
        accessibilityRole="image"
        accessibilityLabel={label}
      >
        {children}
      </View>
      <Text className="mt-3 text-base font-semibold text-text">{label}</Text>
      {showConnector ? <View className="my-4 h-10 w-px bg-border" /> : null}
    </View>
  );
}
