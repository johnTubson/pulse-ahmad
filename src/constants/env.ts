import Constants from 'expo-constants';

export type OcrProviderId = 'google' | 'ocrspace' | 'interfaze';

type AppExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  ocrProvider?: string;
  ocrApiKey?: string;
  ocrSpaceApiKey?: string;
  ocrSpaceUrl?: string;
  interfazeApiKey?: string;
  useMockData?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

function truthyEnv(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  return value === '1' || value.toLowerCase() === 'true';
}

function parseOcrProvider(value: string | undefined): OcrProviderId {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'ocrspace' || normalized === 'interfaze' || normalized === 'google') {
    return normalized;
  }
  return 'google';
}

export const env = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  /** Active OCR backend: google (default), ocrspace, or interfaze. */
  ocrProvider: parseOcrProvider(extra.ocrProvider),
  ocrApiKey: extra.ocrApiKey ?? '',
  ocrSpaceApiKey: extra.ocrSpaceApiKey ?? '',
  /** Optional PRO / regional OCR.space endpoint; defaults to free parse/image. */
  ocrSpaceUrl: extra.ocrSpaceUrl ?? '',
  interfazeApiKey: extra.interfazeApiKey ?? '',
  /** When true, skip Supabase and hydrate stores with seed expenses/moods. */
  useMockData: truthyEnv(extra.useMockData),
} as const;
