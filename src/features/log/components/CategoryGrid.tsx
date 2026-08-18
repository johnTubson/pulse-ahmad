import { Text, View } from 'react-native';

import { CategoryTile } from '@/features/log/components/CategoryTile';
import { useUiStore } from '@/stores/uiStore';
import { CATEGORY_IDS, type CategoryId } from '@/types/finance';
import { cn } from '@/utils/cn';

type CategoryGridProps = {
  selectedId: CategoryId | null;
  onSelect: (id: CategoryId) => void;
  /** When true, include categories the user has hidden (edit flows). */
  includeHidden?: boolean;
  className?: string;
};

function chunkCategories(ids: CategoryId[], size: number): CategoryId[][] {
  const rows: CategoryId[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    rows.push(ids.slice(i, i + size));
  }
  return rows;
}

export function CategoryGrid({
  selectedId,
  onSelect,
  includeHidden = false,
  className,
}: CategoryGridProps) {
  const hiddenCategoryIds = useUiStore((s) => s.hiddenCategoryIds);
  const visible = includeHidden
    ? CATEGORY_IDS
    : CATEGORY_IDS.filter((id) => !hiddenCategoryIds.includes(id));
  const ids = selectedId && !visible.includes(selectedId) ? [...visible, selectedId] : visible;
  const rows = chunkCategories(ids, 3);

  return (
    <View className={cn('rounded-2xl bg-grey-100 p-3', className)}>
      <Text className="mb-2.5 text-sm font-medium text-text-muted">Category</Text>
      <View className="gap-2">
        {rows.map((row) => (
          <View key={row.join('-')} className="flex-row gap-2">
            {row.map((id) => (
              <CategoryTile
                key={id}
                categoryId={id}
                selected={selectedId === id}
                onPress={() => onSelect(id)}
              />
            ))}
            {row.length < 3
              ? Array.from({ length: 3 - row.length }).map((_, index) => (
                  <View key={`pad-${index}`} className="flex-1" />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}
