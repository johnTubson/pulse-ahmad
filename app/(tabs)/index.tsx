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
          onProfilePress={() => router.push('/(tabs)/personality')}
          onNotificationsPress={() => router.push('/notifications')}
          onLogMood={() => router.push('/log')}
          onSeeEvidence={() => router.push('/(tabs)/analytics')}
          onSeeAll={() => router.push('/(tabs)/analytics')}
          onExpensePress={(id) => router.push(`/expense/${id}`)}
        />
      </Screen>
      <Fab onPress={() => router.push('/log')} />
    </View>
  );
}
