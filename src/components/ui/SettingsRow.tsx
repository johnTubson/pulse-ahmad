import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type SettingsRowProps = {
  label: string;
  icon: SymbolName;
  onPress: () => void;
  showChevron?: boolean;
  trailing?: ReactNode;
  className?: string;
};

export function SettingsRow({
  label,
  icon,
  onPress,
  showChevron = true,
  trailing,
  className,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn('flex-row items-center gap-3 px-4 py-3.5 active:bg-grey-100', className)}
      onPress={onPress}
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-grey-100">
        <SymbolView name={icon} tintColor={palette.text} size={18} />
      </View>
      <Text className="flex-1 text-base font-medium text-text">{label}</Text>
      {trailing}
      {showChevron ? (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          tintColor={palette.textMuted}
          size={16}
        />
      ) : null}
    </Pressable>
  );
}

type SignOutRowProps = {
  onPress: () => void;
  loading?: boolean;
};

export function SignOutRow({ onPress, loading }: SignOutRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 active:opacity-70"
      disabled={loading}
      onPress={onPress}
    >
      <Text className="text-base font-medium text-text">
        {loading ? 'Signing out…' : 'Sign out'}
      </Text>
      <SymbolView
        name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
        tintColor={palette.textMuted}
        size={20}
      />
    </Pressable>
  );
}
