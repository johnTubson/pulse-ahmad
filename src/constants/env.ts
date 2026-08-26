import Constants from 'expo-constants';

export type OcrProviderId = 'google' | 'ocrspace' | 'interfaze' | 'llm';

type AppExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  ocrProvider?: string;
  ocrApiKey?: string;
  ocrSpaceApiKey?: string;
  ocrSpaceUrl?: string;
  interfazeApiKey?: string;
  openRouterApiKey?: string;
  openRouterModel?: string;
  openRouterFallbackModels?: string;
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
  if (
    normalized === 'ocrspace' ||
    normalized === 'interfaze' ||
    normalized === 'google' ||
    normalized === 'llm'
  ) {
    return normalized;
  }
  return 'llm';
}

export const env = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  /** Active OCR backend: llm (default), google, ocrspace, or interfaze. */
  ocrProvider: parseOcrProvider(extra.ocrProvider),
  ocrApiKey: extra.ocrApiKey ?? '',
  ocrSpaceApiKey: extra.ocrSpaceApiKey ?? '',
  /** Optional PRO / regional OCR.space endpoint; defaults to free parse/image. */
  ocrSpaceUrl: extra.ocrSpaceUrl ?? '',
  interfazeApiKey: extra.interfazeApiKey ?? '',
  openRouterApiKey: extra.openRouterApiKey ?? '',
  /** OpenRouter model id for `llm` OCR (default: qwen/qwen3.7-flash). */
  openRouterModel: extra.openRouterModel ?? '',
  /**
   * Comma-separated OpenRouter vision models tried after the primary on rate limit.
   * Empty uses the built-in cheap defaults in `openRouter.ts`.
   */
  openRouterFallbackModels: extra.openRouterFallbackModels ?? '',
  /** When true, skip Supabase and hydrate stores with seed expenses/moods. */
  useMockData: truthyEnv(extra.useMockData),
} as const;
