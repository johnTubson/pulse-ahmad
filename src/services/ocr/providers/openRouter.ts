import { env } from '@/constants/env';
import {
  extractRecognizeResultFromChatContent,
  RECEIPT_JSON_OBJECT_INSTRUCTION,
  type ChatCompletionResponse,
} from '@/services/ocr/receiptSchema';
import {
  jpegDataUrl,
  OcrError,
  requireApiKey,
  throwIfHttpFailed,
  type RecognizeResult,
} from '@/services/ocr/types';

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const DEFAULT_OPENROUTER_OCR_MODEL = 'qwen/qwen3.7-flash';

/**
 * Cheap vision models tried after the primary when OpenRouter returns a rate limit.
 * Spread across Google / OpenAI / Mistral so a single-provider quota is less likely to block scans.
 */
export const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  'qwen/qwen3.5-flash-02-23', // ~$0.06 / $0.26 per 1M
  'google/gemma-3-4b-it', // ~$0.05 / $0.10 per 1M
  'mistralai/mistral-small-3.2-24b-instruct', // ~$0.09 / $0.25 per 1M
] as const;

export const DEFAULT_OPENROUTER_MAX_TOKENS = 2048;

export type OpenRouterChatResponse = ChatCompletionResponse;

export function extractRecognizeResultFromOpenRouter(
  body: OpenRouterChatResponse,
): RecognizeResult {
  return extractRecognizeResultFromChatContent(body);
}

export function parseOpenRouterFallbackModels(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Primary (env or default) then fallbacks. Dedupes while preserving order.
 * Custom fallback CSV replaces the built-in list when non-empty.
 */
export function resolveOpenRouterModelCascade(primary: string, fallbackCsv: string = ''): string[] {
  const primaryModel = primary.trim() || DEFAULT_OPENROUTER_OCR_MODEL;
  const customFallbacks = parseOpenRouterFallbackModels(fallbackCsv);
  const fallbacks =
    customFallbacks.length > 0 ? customFallbacks : [...DEFAULT_OPENROUTER_FALLBACK_MODELS];

  const cascade: string[] = [];
  const seen = new Set<string>();
  for (const id of [primaryModel, ...fallbacks]) {
    if (seen.has(id)) continue;
    seen.add(id);
    cascade.push(id);
  }
  return cascade;
}

export function isOpenRouterRateLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('rate limit') ||
    normalized.includes('rate-limit') ||
    normalized.includes('ratelimit') ||
    normalized.includes('too many requests') ||
    /\b429\b/.test(normalized)
  );
}

export function isOpenRouterRateLimitError(error: unknown): boolean {
  if (!(error instanceof OcrError)) return false;
  if (error.code !== 'http' && error.code !== 'api') return false;
  return isOpenRouterRateLimitMessage(error.message);
}

function buildChatBody(model: string, base64Image: string): string {
  return JSON.stringify({
    model,
    temperature: 0,
    max_tokens: DEFAULT_OPENROUTER_MAX_TOKENS,
    // Qwen 3.7+ may think by default; harmless for models that ignore it.
    reasoning: { effort: 'none' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: RECEIPT_JSON_OBJECT_INSTRUCTION,
          },
          {
            type: 'image_url',
            image_url: { url: jpegDataUrl(base64Image) },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });
}

async function recognizeWithOpenRouterModel(
  apiKey: string,
  model: string,
  base64Image: string,
): Promise<RecognizeResult> {
  let response: Response;
  try {
    response = await fetch(OPENROUTER_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pulse.app',
        'X-OpenRouter-Title': 'Pulse',
      },
      body: buildChatBody(model, base64Image),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new OcrError(`OpenRouter network error: ${detail}`, 'http');
  }

  if (response.status === 429) {
    const detail = await response.text().catch(() => '');
    throw new OcrError(detail || 'OpenRouter rate limit (429).', 'http');
  }

  await throwIfHttpFailed(response, 'OpenRouter');

  const body = (await response.json()) as OpenRouterChatResponse;
  if (body.error?.message && isOpenRouterRateLimitMessage(body.error.message)) {
    throw new OcrError(body.error.message, 'api');
  }

  return extractRecognizeResultFromOpenRouter(body);
}

/**
 * OpenRouter chat completions with JSON mode (Qwen 3.7 Flash by default).
 * On rate limit / 429, tries cheap vision fallbacks (or
 * `EXPO_PUBLIC_OPENROUTER_FALLBACK_MODELS`).
 */
export async function recognizeWithOpenRouter(base64Image: string): Promise<RecognizeResult> {
  const apiKey = requireApiKey(
    env.openRouterApiKey,
    'OpenRouter API key is missing. Set EXPO_PUBLIC_OPENROUTER_API_KEY in your .env.',
  );

  const cascade = resolveOpenRouterModelCascade(env.openRouterModel, env.openRouterFallbackModels);

  let lastRateLimit: OcrError | null = null;

  for (let i = 0; i < cascade.length; i += 1) {
    const model = cascade[i]!;
    const isLast = i === cascade.length - 1;

    try {
      return await recognizeWithOpenRouterModel(apiKey, model, base64Image);
    } catch (error) {
      if (!isOpenRouterRateLimitError(error)) throw error;
      lastRateLimit = error as OcrError;
      if (isLast) break;
    }
  }

  throw (
    lastRateLimit ??
    new OcrError('OpenRouter rate limit exceeded on all configured models.', 'http')
  );
}
