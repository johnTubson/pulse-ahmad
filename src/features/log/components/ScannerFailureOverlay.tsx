import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { cn } from '@/utils/cn';

type ScannerFailureOverlayProps = {
  message: string;
  onEnterManually: () => void;
  onTryAgain: () => void;
  className?: string;
};

export function ScannerFailureOverlay({
  message,
  onEnterManually,
  onTryAgain,
  className,
}: ScannerFailureOverlayProps) {
  return (
    <View className={cn('items-center px-2', className)}>
      <Text className="mb-1 text-center text-lg font-bold text-text">Scan incomplete</Text>
      <Text className="mb-5 text-center text-sm text-text-muted">{message}</Text>
      <PrimaryButton label="Enter amount manually" onPress={onEnterManually} />
      <View className="h-3" />
      <SecondaryButton label="Try again" onPress={onTryAgain} />
    </View>
  );
}

export const SCANNER_FAILURE_HEADER = 'Scan incomplete';
