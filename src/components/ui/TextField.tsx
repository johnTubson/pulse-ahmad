import { Text, TextInput, TextInputProps, View } from 'react-native';

import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  className?: string;
};

export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  return (
    <View className={cn('w-full', className)}>
      <Text className="mb-2 text-sm font-medium text-text">{label}</Text>
      <TextInput
        className={cn(
          'rounded-xl bg-grey-100 px-4 py-3.5 text-base text-text',
          error && 'border border-error',
        )}
        placeholderTextColor={palette.textMuted}
        {...inputProps}
      />
      {error ? <Text className="mt-1.5 text-sm text-error">{error}</Text> : null}
    </View>
  );
}
