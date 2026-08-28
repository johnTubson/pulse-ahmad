import { z } from 'zod';

import {
  EMPTY_OCR_TEXT,
  OcrError,
  textOnlyResult,
  type RecognizeResult,
} from '@/services/ocr/types';
import { CATEGORY_IDS, type CategoryId } from '@/types/finance';

export const ReceiptSchema = z.object({
  merchant: z.string().nullable().describe('Store or merchant name'),
  amount: z.number().nullable().describe('Receipt total / amount due'),
  date: z.string().nullable().describe('Purchase date if visible'),
  note: z.string().nullable().describe('Short expense note, e.g. what was purchased'),
  category: z.enum(CATEGORY_IDS as [CategoryId, ...CategoryId[]]).nullish(),
});

/** Prompt text for JSON-mode models that lack native json_schema enforcement. */
export const RECEIPT_JSON_OBJECT_INSTRUCTION = [
  'Extract receipt fields from the image.',
  'Respond with a JSON object only, using these keys:',
  'merchant (string or null): store or merchant name,',
  'amount (number or null): receipt total / amount due,',
  'date (string or null): purchase date if visible,',
  'note (string or null): short expense note, e.g. what was purchased,',
  `category (string or null): one of ${CATEGORY_IDS.join(', ')}.`,
].join(' ');

/** Static schema payload; built once (OpenAI-style structured outputs reject `$schema`). */
export const RECEIPT_JSON_SCHEMA = (() => {
  const schema = z.toJSONSchema(ReceiptSchema) as Record<string, unknown>;
  const { $schema: _schema, ...rest } = schema;
  return rest;
})();

export type ChatCompletionResponse = {
  choices?: {
    message?: {
      content?: string | null;
      /** Some reasoning models put the answer here when `content` is empty. */
      reasoning?: string | null;
    };
  }[];
  error?: { message?: string; type?: string; code?: string };
};

/**
 * Parses OpenAI-style chat completion content as structured receipt JSON.
 * Optional `fallbackText` is used for `text` when structured parse succeeds.
 */
export function extractRecognizeResultFromChatContent(
  body: ChatCompletionResponse,
  fallbackText?: string | null,
): RecognizeResult {
  if (body.error?.message) {
    throw new OcrError(body.error.message, 'api');
  }

  const message = body.choices?.[0]?.message;
  const content = message?.content?.trim() || message?.reasoning?.trim() || '';
  const fallback = fallbackText?.trim() || null;

  if (content) {
    try {
      const parsed = ReceiptSchema.parse(JSON.parse(content));
      return {
        text: fallback ?? content,
        amount: parsed.amount,
        merchant: parsed.merchant?.trim() || null,
        note: parsed.note?.trim() || null,
        date: parsed.date?.trim() || null,
        categoryId: parsed.category ?? null,
      };
    } catch {
      // Content may be plain text or malformed JSON; fall through.
    }
  }

  if (fallback) {
    return textOnlyResult(fallback);
  }

  if (content) {
    return textOnlyResult(content);
  }

  throw new OcrError(EMPTY_OCR_TEXT, 'empty');
}
