import { Pressable, Text } from 'react-native';

import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

type ToastBannerProps = {
  className?: string;
};

export function ToastBanner({ className }: ToastBannerProps) {
  const toast = useUiStore((s) => s.toast);
  const dismissToast = useUiStore((s) => s.dismissToast);

  if (!toast) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={toast}
      className={cn('mb-3 rounded-xl bg-text px-4 py-3 active:opacity-80', className)}
      onPress={dismissToast}
    >
      <Text className="text-center text-sm font-medium text-white">{toast}</Text>
    </Pressable>
  );
}
