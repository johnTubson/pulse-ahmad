import { router } from 'expo-router';
import { View } from 'react-native';

import { Fab } from '@/components/ui/Fab';
import { Screen } from '@/components/ui/Screen';
import { HomeContent } from '@/features/dashboard/components/HomeContent';

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <Screen scroll>
        <HomeContent
          onProfilePress={() => router.push('/(tabs)/profile')}
          onLogMood={() => router.push('/(tabs)/log')}
          onSeeEvidence={() => router.push('/(tabs)/analytics')}
          onSeeAll={() => router.push('/(tabs)/analytics')}
        />
      </Screen>
      <Fab onPress={() => router.push('/(tabs)/log')} />
    </View>
  );
}
