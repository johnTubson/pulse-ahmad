/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'Pulse',
  slug: 'pulse',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pulse',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.johntubson.pulse',
    infoPlist: {
      NSMotionUsageDescription: 'Pulse uses motion sensors for shake-to-log quick expense entry.',
    },
  },
  android: {
    package: 'com.johntubson.pulse',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.RECORD_AUDIO',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Pulse to scan receipts for expense logging.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Pulse to attach receipt photos from your library.',
      },
    ],
    'expo-sensors',
    'expo-notifications',
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    ocrProvider: process.env.EXPO_PUBLIC_OCR_PROVIDER ?? 'llm',
    ocrApiKey: process.env.EXPO_PUBLIC_OCR_API_KEY ?? '',
    ocrSpaceApiKey: process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? '',
    ocrSpaceUrl: process.env.EXPO_PUBLIC_OCR_SPACE_URL ?? '',
    interfazeApiKey: process.env.EXPO_PUBLIC_INTERFAZE_API_KEY ?? '',
    openRouterApiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '',
    openRouterModel: process.env.EXPO_PUBLIC_OPENROUTER_MODEL ?? '',
    openRouterFallbackModels: process.env.EXPO_PUBLIC_OPENROUTER_FALLBACK_MODELS ?? '',
    useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
    eas: {
      projectId: 'c2b6d532-7866-427b-a823-0d0b808acb94',
    },
  },
};

module.exports = config;
