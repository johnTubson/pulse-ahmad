import {
  DEFAULT_OPENROUTER_FALLBACK_MODELS,
  DEFAULT_OPENROUTER_OCR_MODEL,
  extractRecognizeResultFromOpenRouter,
  isOpenRouterRateLimitError,
  isOpenRouterRateLimitMessage,
  parseOpenRouterFallbackModels,
  recognizeWithOpenRouter,
  resolveOpenRouterModelCascade,
  type OpenRouterChatResponse,
} from '@/services/ocr/providers/openRouter';
import { OcrError } from '@/services/ocr/types';

jest.mock('@/constants/env', () => ({
  env: {
    openRouterApiKey: 'test-openrouter-key',
    openRouterModel: '',
    openRouterFallbackModels: '',
  },
}));

describe('DEFAULT_OPENROUTER_OCR_MODEL', () => {
  it('uses Qwen 3.7 Flash', () => {
    expect(DEFAULT_OPENROUTER_OCR_MODEL).toBe('qwen/qwen3.7-flash');
  });
});

describe('resolveOpenRouterModelCascade', () => {
  it('puts primary first then built-in fallbacks', () => {
    expect(resolveOpenRouterModelCascade('')).toEqual([
      DEFAULT_OPENROUTER_OCR_MODEL,
      ...DEFAULT_OPENROUTER_FALLBACK_MODELS,
    ]);
  });

  it('dedupes when primary is already a fallback', () => {
    expect(resolveOpenRouterModelCascade('openai/gpt-4o-mini')).toEqual([
      'openai/gpt-4o-mini',
      'google/gemini-2.5-flash-lite',
      'mistralai/mistral-small-3.2-24b-instruct',
    ]);
  });

  it('uses custom fallback CSV when provided', () => {
    expect(resolveOpenRouterModelCascade('primary/model', 'a/b, c/d')).toEqual([
      'primary/model',
      'a/b',
      'c/d',
    ]);
  });
});

describe('parseOpenRouterFallbackModels', () => {
  it('splits and trims', () => {
    expect(parseOpenRouterFallbackModels(' a/b , ,c/d ')).toEqual(['a/b', 'c/d']);
  });
});

describe('isOpenRouterRateLimitMessage', () => {
  it('detects common rate-limit phrasing', () => {
    expect(isOpenRouterRateLimitMessage('Rate limit exceeded')).toBe(true);
    expect(isOpenRouterRateLimitMessage('HTTP 429 Too Many Requests')).toBe(true);
    expect(isOpenRouterRateLimitMessage('Invalid API key')).toBe(false);
  });
});

describe('isOpenRouterRateLimitError', () => {
  it('only matches http/api OcrErrors with rate-limit text', () => {
    expect(isOpenRouterRateLimitError(new OcrError('rate limit hit', 'http'))).toBe(true);
    expect(isOpenRouterRateLimitError(new OcrError('rate limit hit', 'api'))).toBe(true);
    expect(isOpenRouterRateLimitError(new OcrError('rate limit hit', 'empty'))).toBe(false);
    expect(isOpenRouterRateLimitError(new OcrError('bad key', 'http'))).toBe(false);
    expect(isOpenRouterRateLimitError(new Error('rate limit'))).toBe(false);
  });
});

describe('extractRecognizeResultFromOpenRouter', () => {
  it('parses structured receipt JSON', () => {
    const content = JSON.stringify({
      merchant: 'Coffee Shop',
      amount: 4.5,
      date: '2026-08-10',
      note: 'Latte and muffin',
    });
    const body: OpenRouterChatResponse = {
      choices: [{ message: { content } }],
    };

    expect(extractRecognizeResultFromOpenRouter(body)).toEqual({
      text: content,
      amount: 4.5,
      merchant: 'Coffee Shop',
      note: 'Latte and muffin',
      date: '2026-08-10',
      categoryId: null,
    });
  });

  it('falls back to plain content when JSON is invalid', () => {
    const body: OpenRouterChatResponse = {
      choices: [{ message: { content: 'TOTAL 3.00' } }],
    };

    expect(extractRecognizeResultFromOpenRouter(body)).toEqual({
      text: 'TOTAL 3.00',
      amount: null,
      merchant: null,
      note: null,
      date: null,
      categoryId: null,
    });
  });

  it('falls back to message.reasoning when content is empty', () => {
    const content = JSON.stringify({
      merchant: 'Market',
      amount: 12,
      date: null,
      note: 'Groceries',
    });
    const body: OpenRouterChatResponse = {
      choices: [{ message: { content: null, reasoning: content } }],
    };

    expect(extractRecognizeResultFromOpenRouter(body)).toEqual({
      text: content,
      amount: 12,
      merchant: 'Market',
      note: 'Groceries',
      date: null,
      categoryId: null,
    });
  });

  it('throws on API error object', () => {
    expect(() =>
      extractRecognizeResultFromOpenRouter({
        error: { message: 'Invalid API key provided.' },
      }),
    ).toThrow(OcrError);
  });

  it('throws when nothing usable is present', () => {
    expect(() => extractRecognizeResultFromOpenRouter({ choices: [] })).toThrow(OcrError);
  });
});

describe('recognizeWithOpenRouter fallbacks', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function jsonResponse(status: number, body: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
      json: async () => body,
    } as Response;
  }

  it('tries the next model after HTTP 429', async () => {
    const successBody = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              merchant: 'Fallback Shop',
              amount: 9.5,
              date: null,
              note: 'Snack',
            }),
          },
        },
      ],
    };

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, 'Rate limit exceeded'))
      .mockResolvedValueOnce(jsonResponse(200, successBody));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await recognizeWithOpenRouter('abc123');

    expect(result.merchant).toBe('Fallback Shop');
    expect(result.amount).toBe(9.5);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstBody = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body));
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1]![1]?.body));
    expect(firstBody.model).toBe(DEFAULT_OPENROUTER_OCR_MODEL);
    expect(secondBody.model).toBe(DEFAULT_OPENROUTER_FALLBACK_MODELS[0]);
  });

  it('does not fall through on non-rate-limit HTTP errors', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(jsonResponse(401, 'Unauthorized'));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(recognizeWithOpenRouter('abc123')).rejects.toMatchObject({
      code: 'http',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws the last rate-limit error when every model is limited', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse(429, 'Rate limit exceeded'));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(recognizeWithOpenRouter('abc123')).rejects.toMatchObject({
      code: 'http',
      message: expect.stringMatching(/rate limit/i),
    });
    expect(fetchMock).toHaveBeenCalledTimes(1 + DEFAULT_OPENROUTER_FALLBACK_MODELS.length);
  });
});
