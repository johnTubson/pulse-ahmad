import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type SegmentOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View className={cn('flex-row rounded-full bg-grey-100 p-1', className)}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              'flex-1 items-center rounded-full px-3 py-2.5',
              // Keep shadow-* on both branches — toggling shadow-sm ↔ none
              // trips a NativeWind/Expo Router navigation-context crash.
              selected ? 'bg-surface shadow-sm' : 'bg-transparent shadow-none',
            )}
            style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
            onPress={() => onChange(option.id)}
          >
            <Text
              className={cn('text-sm font-semibold', selected ? 'text-text' : 'text-text-muted')}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
