import { ListIcon } from 'phosphor-react-native/src/icons/List';
import { UserCircleIcon } from 'phosphor-react-native/src/icons/UserCircle';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type ProfileMenuPillProps = {
  onPress: () => void;
  className?: string;
};

export function ProfileMenuPill({ onPress, className }: ProfileMenuPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open personality"
      className={cn(
        'flex-row items-center gap-2 rounded-full bg-grey-100 px-3 py-2 active:opacity-80',
        className,
      )}
      onPress={onPress}
    >
      <Icon icon={UserCircleIcon} color={palette.textMuted} size={20} />
      <View className="h-4 w-px bg-grey-300" />
      <Icon icon={ListIcon} color={palette.textMuted} size={18} />
    </Pressable>
  );
}
