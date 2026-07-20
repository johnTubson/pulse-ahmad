import { Pressable, Text, View } from 'react-native';

type SectionHeaderWithLinkProps = {
  title: string;
  linkLabel?: string;
  onLinkPress?: () => void;
};

export function SectionHeaderWithLink({
  title,
  linkLabel,
  onLinkPress,
}: SectionHeaderWithLinkProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-bold text-text">{title}</Text>
      {linkLabel && onLinkPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={linkLabel}
          className="active:opacity-70"
          onPress={onLinkPress}
        >
          <Text className="text-sm font-semibold text-primary">{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
