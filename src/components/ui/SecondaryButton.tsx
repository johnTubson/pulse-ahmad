import { Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
};

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  className,
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={cn(
        'min-h-[48px] w-full items-center justify-center rounded-full border-2 border-primary bg-transparent px-6 py-3.5 active:opacity-80',
        disabled && 'opacity-60',
        className,
      )}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-base font-semibold text-primary">{label}</Text>
    </Pressable>
  );
}
