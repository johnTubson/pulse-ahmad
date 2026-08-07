import { Text, View } from 'react-native';

import { DEFAULT_CATEGORIES } from '@/lib/mock/seedData';

export function CategoriesSettings() {
  return (
    <View className="gap-3">
      <Text className="text-sm text-text-muted">
        Default spending categories. Add, hide, and reorder arrive with the next design pass.
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {DEFAULT_CATEGORIES.map((category, index) => (
          <View key={category.id}>
            {index > 0 ? <View className="ml-14 h-px bg-border" /> : null}
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <Text className="text-xl">{category.icon}</Text>
              <Text className="flex-1 text-base font-medium text-text">{category.name}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
