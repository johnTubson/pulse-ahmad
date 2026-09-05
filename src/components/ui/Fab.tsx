import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { hapticMedium } from '@/utils/haptics';

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
      onPress={() => {
        hapticMedium();
        onPress();
      }}
    >
      <Icon icon={PlusIcon} color="#fff" size={28} weight="bold" />
    </Pressable>
  );
}
