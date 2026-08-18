import { Switch, Text, View } from 'react-native';

import { CATEGORY_META } from '@/constants/categories';
import { palette } from '@/constants/theme';
import { useUiStore } from '@/stores/uiStore';
import { CATEGORY_IDS, type CategoryId } from '@/types/finance';

export function CategoriesSettings() {
  const hiddenCategoryIds = useUiStore((s) => s.hiddenCategoryIds);
  const toggleHiddenCategory = useUiStore((s) => s.toggleHiddenCategory);

  return (
    <View className="gap-3">
      <Text className="text-sm text-text-muted">
        Built-in spending categories. Hide ones you rarely use; they stay available when editing
        past expenses.
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {CATEGORY_IDS.map((id: CategoryId, index) => {
          const meta = CATEGORY_META[id];
          const hidden = hiddenCategoryIds.includes(id);
          return (
            <View key={id}>
              {index > 0 ? <View className="ml-14 h-px bg-border" /> : null}
              <View className="flex-row items-center gap-3 px-4 py-3.5">
                <Text className="text-xl">{meta.emoji}</Text>
                <Text className="flex-1 text-base font-medium text-text">{meta.label}</Text>
                <Switch
                  value={!hidden}
                  onValueChange={() => toggleHiddenCategory(id)}
                  trackColor={{ true: palette.primary }}
                  accessibilityLabel={`${hidden ? 'Show' : 'Hide'} ${meta.label}`}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
