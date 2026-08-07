import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type ReceiptAttachedRowProps = {
  onRemove: () => void;
  className?: string;
};

export function ReceiptAttachedRow({ onRemove, className }: ReceiptAttachedRowProps) {
  return (
    <View
      className={cn(
        'min-h-[48px] flex-row items-center justify-between rounded-xl bg-grey-100 px-3.5',
        className,
      )}
    >
      <Text className="text-sm font-medium text-text">Receipt attached</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove receipt"
        className="rounded-full border border-primary px-3 py-1 active:opacity-70"
        onPress={onRemove}
      >
        <Text className="text-xs font-semibold text-primary">Remove</Text>
      </Pressable>
    </View>
  );
}
