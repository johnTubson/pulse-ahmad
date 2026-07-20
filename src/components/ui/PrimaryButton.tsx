import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  className,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={cn(
        'min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3.5 active:opacity-80',
        isDisabled ? 'bg-border' : 'bg-primary',
        className,
      )}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text
          className={cn('text-base font-semibold', isDisabled ? 'text-white/80' : 'text-white')}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
