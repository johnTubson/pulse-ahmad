import { View } from 'react-native';

/** Abstract figure matching ONB-01: pink head, orange body, floating circles. */
export function IllustrationHero() {
  return (
    <View className="h-56 w-full items-center justify-center" accessibilityElementsHidden>
      <View className="relative h-48 w-48 items-center justify-end">
        {/* Soft ground shadow */}
        <View className="absolute bottom-2 h-6 w-36 rounded-full bg-pink-100 opacity-70" />

        {/* Floating circles (top-right) */}
        <View className="absolute right-2 top-2 h-14 w-14 rounded-full bg-pink-100" />
        <View className="absolute right-0 top-16 h-5 w-5 rounded-full bg-orange-400" />
        <View className="absolute right-10 top-12 h-3.5 w-3.5 rounded-full bg-orange-400" />
        <View className="absolute right-4 top-24 h-2.5 w-2.5 rounded-full bg-orange-300" />

        {/* Head */}
        <View className="z-10 mb-[-8px] h-20 w-20 rounded-full bg-pink-100" />

        {/* Body */}
        <View className="h-28 w-28 rounded-b-[40px] rounded-t-full bg-orange-400" />
      </View>
    </View>
  );
}
