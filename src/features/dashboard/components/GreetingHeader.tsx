import { Text, View } from 'react-native';

import { NotificationBellButton } from '@/components/ui/NotificationBellButton';

type GreetingHeaderProps = {
  greeting: string;
  name: string;
  onProfilePress: () => void;
  onNotificationsPress: () => void;
};

export function GreetingHeader({
  greeting,
  name,
  onProfilePress,
  onNotificationsPress,
}: GreetingHeaderProps) {
  return (
    <View className="mb-5 mt-2 flex-row items-start justify-between gap-3">
      <Text className="flex-1 text-2xl font-bold leading-8 text-text">
        {greeting} {name},
      </Text>
      <View className="flex-row items-center gap-2">
        <NotificationBellButton onPress={onNotificationsPress} />
        {/* <ProfileMenuPill onPress={onProfilePress} /> */}
      </View>
    </View>
  );
}
