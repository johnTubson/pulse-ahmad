import { View } from 'react-native';

export function ListSegmentFallback() {
  return (
    <View className="min-h-0 flex-1 gap-4">
      <View className="h-36 rounded-3xl bg-primary-50" />
      <View className="h-5 w-24 rounded bg-grey-100" />
      <View className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-grey-100" />
    </View>
  );
}
