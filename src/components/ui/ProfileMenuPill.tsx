import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

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
      <SymbolView
        name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
        tintColor={palette.textMuted}
        size={20}
      />
      <View className="h-4 w-px bg-grey-300" />
      <SymbolView
        name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
        tintColor={palette.textMuted}
        size={18}
      />
    </Pressable>
  );
}
