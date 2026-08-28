import 'react-native-get-random-values';
import '../global.css';

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { bootstrapApp } from '@/bootstrap';
import { QuickLogOverlay } from '@/features/log/components/QuickLogOverlay';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
bootstrapApp();

let splashHidden = false;

function SplashHider() {
  return (
    <View
      collapsable={false}
      style={{ width: 0, height: 0 }}
      onLayout={() => {
        if (splashHidden) return;
        splashHidden = true;
        void SplashScreen.hideAsync();
      }}
    />
  );
}

/** Declarative redirects; Stack stays mounted as a sibling to avoid remount flicker. */
function AuthRedirect() {
  const status = useAuthStore((s) => s.status);
  const hasCompletedOnboarding = useUiStore((s) => s.hasCompletedOnboarding);
  const segments = useSegments();

  const inAuthGroup = segments[0] === '(auth)';

  if (status === 'unauthenticated' && !inAuthGroup) {
    return <Redirect href="/(auth)" />;
  }

  if (status === 'authenticated' && !hasCompletedOnboarding && !inAuthGroup) {
    return <Redirect href="/(auth)/how-it-works" />;
  }

  if (status === 'authenticated' && hasCompletedOnboarding && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Manrope: Manrope_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const status = useAuthStore((state) => state.status);

  if (error) throw error;

  if (!loaded || status === 'loading') {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SplashHider />
      <AuthRedirect />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
        <Stack.Screen
          name="log"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="expense/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen
          name="scan"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <QuickLogOverlay />
    </GestureHandlerRootView>
  );
}
