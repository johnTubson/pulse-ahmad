import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-lg font-semibold text-text">This screen does not exist.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-base font-semibold text-primary">Go to dashboard</Text>
        </Link>
      </View>
    </>
  );
}
