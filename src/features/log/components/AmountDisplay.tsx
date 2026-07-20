import { Text, TextInput, View } from 'react-native';

import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type AmountDisplayProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function sanitizeAmountInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
}

export function AmountDisplay({ value, onChangeText, className }: AmountDisplayProps) {
  return (
    <View className={cn('items-center', className)}>
      <Text className="mb-2 text-center text-base font-medium text-text">
        How much did you spend?
      </Text>
      <View className="flex-row items-center justify-center">
        <Text className="text-4xl font-bold text-text">$</Text>
        <TextInput
          accessibilityLabel="Expense amount"
          className="min-w-[96px] text-4xl font-bold text-text"
          value={value}
          onChangeText={(text) => onChangeText(sanitizeAmountInput(text))}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={palette.textMuted}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
