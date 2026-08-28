import { router } from 'expo-router';
import { View } from 'react-native';

import { Fab } from '@/components/ui/Fab';
import { Screen } from '@/components/ui/Screen';
import { PersonalityContent } from '@/features/personality/components/PersonalityContent';

export default function PersonalityScreen() {
  return (
    <View className="flex-1">
      <Screen scroll>
        <PersonalityContent
          onSettingsPress={() => router.push('/(tabs)/personality/settings')}
          onNotificationsPress={() => router.push('/notifications')}
        />
      </Screen>
      <Fab onPress={() => router.push('/log')} />
    </View>
  );
}
