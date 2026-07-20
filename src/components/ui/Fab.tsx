import { Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

type FabProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  className?: string;
};

export function Fab({ onPress, accessibilityLabel = 'Log expense', className }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'absolute bottom-6 right-5 z-10 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-md active:opacity-80',
        className,
      )}
      onPress={onPress}
    >
      <Text className="text-3xl font-light leading-8 text-white">+</Text>
    </Pressable>
  );
}
