import { Pressable, Text, View } from 'react-native';

import { CATEGORY_META } from '@/constants/categories';
import type { CategoryId } from '@/types/finance';
import { cn } from '@/utils/cn';
import { hapticLight } from '@/utils/haptics';

type CategoryTileProps = {
  categoryId: CategoryId;
  selected: boolean;
  onPress: () => void;
};

export function CategoryTile({ categoryId, selected, onPress }: CategoryTileProps) {
  const meta = CATEGORY_META[categoryId];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={meta.label}
      className={cn(
        'min-h-[76px] flex-1 rounded-xl border bg-surface p-2.5 active:opacity-80',
        selected ? 'border-2 border-primary' : 'border border-transparent',
      )}
      onPress={() => {
        hapticLight();
        onPress();
      }}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="text-lg">{meta.emoji}</Text>
        <View
          className={cn(
            'h-4 w-4 items-center justify-center rounded-full border',
            selected ? 'border-primary bg-primary' : 'border-border bg-transparent',
          )}
        >
          {selected ? <View className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
        </View>
      </View>
      <Text className="text-xs font-medium text-text" numberOfLines={1}>
        {meta.shortLabel}
      </Text>
    </Pressable>
  );
}
