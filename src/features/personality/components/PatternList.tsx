import { Text, View } from 'react-native';

import { PATTERN_TILE_COLORS } from '@/features/personality/lib/display';
import { cn } from '@/utils/cn';

type PatternListProps = {
  items: string[];
  className?: string;
};

export function PatternList({ items, className }: PatternListProps) {
  return (
    <View className={cn('overflow-hidden rounded-2xl bg-grey-100', className)}>
      {items.map((item, index) => {
        const tile = PATTERN_TILE_COLORS[index % PATTERN_TILE_COLORS.length]!;
        return (
          <View key={`${index}-${item.slice(0, 24)}`}>
            {index > 0 ? <View className="ml-16 h-px bg-border" /> : null}
            <View className="flex-row items-start gap-3 px-3.5 py-3.5">
              <View className={cn('h-10 w-10 items-center justify-center rounded-xl', tile.bg)}>
                <Text className="text-lg">{tile.emoji}</Text>
              </View>
              <Text className="flex-1 pt-1.5 text-sm leading-5 text-text">{item}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
