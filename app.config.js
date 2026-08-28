/** @type {import('expo/config').ConfigContext} */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
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
  },
});
