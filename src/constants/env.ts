import Constants from 'expo-constants';

type AppExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  ocrApiKey?: string;
  useMockData?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

function truthyEnv(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  return value === '1' || value.toLowerCase() === 'true';
}

export const env = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  ocrApiKey: extra.ocrApiKey ?? '',
  /** When true, skip Supabase and hydrate stores with seed expenses/moods. */
  useMockData: truthyEnv(extra.useMockData),
} as const;
