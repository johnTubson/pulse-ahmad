import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon, type AppIcon } from '@/components/ui/Icon';
import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type SettingsRowProps = {
  label: string;
  icon: AppIcon;
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
        <Icon icon={icon} color={palette.text} size={18} />
      </View>
      <Text className="flex-1 text-base font-medium text-text">{label}</Text>
      {trailing}
      {showChevron ? <Icon icon={CaretRightIcon} color={palette.textMuted} size={16} /> : null}
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
      <Icon icon={SignOutIcon} color={palette.textMuted} size={20} />
    </Pressable>
  );
}
