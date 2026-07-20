import { Text, View } from 'react-native';

import { ProfileMenuPill } from '@/components/ui/ProfileMenuPill';

type GreetingHeaderProps = {
  greeting: string;
  name: string;
  onProfilePress: () => void;
};

export function GreetingHeader({ greeting, name, onProfilePress }: GreetingHeaderProps) {
  return (
    <View className="mb-5 mt-2 flex-row items-start justify-between gap-3">
      <Text className="flex-1 text-2xl font-bold leading-8 text-text">
        {greeting} {name},
      </Text>
      <ProfileMenuPill onPress={onProfilePress} />
    </View>
  );
}
