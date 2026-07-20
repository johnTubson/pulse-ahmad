import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogForm } from '@/features/log/components/LogForm';

export default function LogScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <LogForm />
    </View>
  );
}
