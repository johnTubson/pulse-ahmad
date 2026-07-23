import { ActivityIndicator, Text, View } from 'react-native';

import { palette } from '@/constants/theme';

export function ChartsSegmentFallback({ loadingLabel = false }: { loadingLabel?: boolean }) {
  return (
    <View className="gap-6 pb-28">
      {loadingLabel ? (
        <View className="items-center py-4">
          <ActivityIndicator color={palette.primary} />
          <Text className="mt-2 text-sm text-text-muted">Loading charts…</Text>
        </View>
      ) : null}
      <View className="h-36 rounded-3xl bg-primary-50" />
      <View className="h-52 rounded-3xl bg-rose-50" />
      <View className="h-52 rounded-3xl bg-rose-50" />
      <View className="h-64 rounded-3xl bg-surface" />
      <View className="h-44 rounded-3xl bg-primary-50" />
    </View>
  );
}
