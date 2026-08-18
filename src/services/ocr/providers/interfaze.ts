import { z } from 'zod';

import { env } from '@/constants/env';
import {
  EMPTY_OCR_TEXT,
  OcrError,
  jpegDataUrl,
  requireApiKey,
  textOnlyResult,
  throwIfHttpFailed,
  type RecognizeResult,
} from '@/services/ocr/types';

const INTERFAZE_CHAT_URL = 'https://api.interfaze.ai/v1/chat/completions';

export const ReceiptSchema = z.object({
  merchant: z.string().nullable().describe('Store or merchant name'),
  amount: z.number().nullable().describe('Receipt total / amount due'),
  date: z.string().nullable().describe('Purchase date if visible'),
});

export type InterfazePrecontextEntry = {
  name?: string;
  result?: unknown;
};

export type InterfazeChatResponse = {
  choices?: { message?: { content?: string | null } }[];
  precontext?: InterfazePrecontextEntry[];
  error?: { message?: string; type?: string; code?: string };
};

/** Static schema payload; built once (OpenAI-style structured outputs reject `$schema`). */
const RECEIPT_JSON_SCHEMA = (() => {
  const schema = z.toJSONSchema(ReceiptSchema) as Record<string, unknown>;
  const { $schema: _schema, ...rest } = schema;
  return rest;
})();

/** Pulls plain text from an Interfaze OCR precontext entry when present. */
export function extractTextFromInterfazePrecontext(
  precontext: InterfazePrecontextEntry[] | undefined,
): string | null {
  if (!precontext?.length) return null;

  const ocrEntry = precontext.find((entry) => entry.name === 'ocr') ?? precontext[0];
  const result = ocrEntry?.result;
  if (typeof result === 'string') {
    const trimmed = result.trim();
    return trimmed || null;
  }
  if (result && typeof result === 'object' && 'text' in result) {
    const text = (result as { text?: unknown }).text;
    if (typeof text === 'string' && text.trim()) return text.trim();
  }
  return null;
}

/** Prefers structured receipt JSON; falls back to OCR precontext text. */
export function extractRecognizeResultFromInterfaze(body: InterfazeChatResponse): RecognizeResult {
  if (body.error?.message) {
    throw new OcrError(body.error.message, 'api');
  }

  const content = body.choices?.[0]?.message?.content?.trim() ?? '';
  const precontextText = extractTextFromInterfazePrecontext(body.precontext);

  if (content) {
    try {
      const parsed = ReceiptSchema.parse(JSON.parse(content));
      return {
        text: precontextText ?? content,
        amount: parsed.amount,
        merchant: parsed.merchant?.trim() || null,
        date: parsed.date?.trim() || null,
      };
    } catch {
      // Content may be plain text or malformed JSON; fall through.
    }
  }

  if (precontextText) {
    return textOnlyResult(precontextText);
  }

  if (content) {
    return textOnlyResult(content);
  }

  throw new OcrError(EMPTY_OCR_TEXT, 'empty');
}

/** Interfaze chat completions with structured receipt schema and ZDR. */
export async function recognizeWithInterfaze(base64Image: string): Promise<RecognizeResult> {
  const apiKey = requireApiKey(
    env.interfazeApiKey,
    'Interfaze API key is missing. Set EXPO_PUBLIC_INTERFAZE_API_KEY in your .env.',
  );

  const response = await fetch(INTERFAZE_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-interfaze-zdr': 'true',
    },
    body: JSON.stringify({
      model: 'interfaze-beta',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract merchant, total amount, and date from this receipt.',
            },
            {
              type: 'image_url',
              image_url: { url: jpegDataUrl(base64Image) },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'receipt_schema',
          strict: true,
          schema: RECEIPT_JSON_SCHEMA,
        },
      },
    }),
  });

  await throwIfHttpFailed(response, 'Interfaze');

  const body = (await response.json()) as InterfazeChatResponse;
  return extractRecognizeResultFromInterfaze(body);
}
