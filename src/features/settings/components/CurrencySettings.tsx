import { Pressable, Text, View } from 'react-native';

import { CURRENCY_OPTIONS } from '@/features/settings/lib/currencies';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useUiStore } from '@/stores/uiStore';

export function CurrencySettings() {
  const currency = useUiStore((s) => s.currency);
  const setCurrency = useUiStore((s) => s.setCurrency);

  return (
    <View className="gap-3">
      <Text className="text-sm text-text-muted">
        Amounts across the app use this currency. Preview: {formatMoney(1234.5)}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {CURRENCY_OPTIONS.map((option, index) => {
          const selected = option.code === currency;
          return (
            <View key={option.code}>
              {index > 0 ? <View className="ml-4 h-px bg-border" /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="flex-row items-center justify-between px-4 py-4 active:bg-grey-100"
                onPress={() => setCurrency(option.code)}
              >
                <Text className="text-base font-medium text-text">{option.label}</Text>
                {selected ? (
                  <Text className="text-sm font-semibold text-primary">Selected</Text>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
