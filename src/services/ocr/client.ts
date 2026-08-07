import { env } from '@/constants/env';

const VISION_ANNOTATE_URL = 'https://vision.googleapis.com/v1/images:annotate';

export type VisionAnnotateResponse = {
  responses?: {
    fullTextAnnotation?: { text?: string };
    textAnnotations?: { description?: string }[];
    error?: { code?: number; message?: string };
  }[];
  error?: { code?: number; message?: string };
};

export class OcrError extends Error {
  constructor(
    message: string,
    readonly code: 'missing_key' | 'http' | 'api' | 'empty',
  ) {
    super(message);
    this.name = 'OcrError';
  }
}

/** Pulls the full OCR string from a Vision annotate response body. */
export function extractTextFromVisionResponse(body: VisionAnnotateResponse): string {
  if (body.error?.message) {
    throw new OcrError(body.error.message, 'api');
  }

  const first = body.responses?.[0];
  if (!first) {
    throw new OcrError('Vision returned no responses.', 'empty');
  }
  if (first.error?.message) {
    throw new OcrError(first.error.message, 'api');
  }

  const full = first.fullTextAnnotation?.text?.trim();
  if (full) return full;

  const fallback = first.textAnnotations?.[0]?.description?.trim();
  if (fallback) return fallback;

  throw new OcrError('No text found on this receipt.', 'empty');
}

/**
 * Runs Google Cloud Vision DOCUMENT_TEXT_DETECTION on a base64 JPEG/PNG.
 * Uses `EXPO_PUBLIC_OCR_API_KEY` (API key restricted to Vision API).
 */
export async function recognizeText(base64Image: string): Promise<string> {
  const apiKey = env.ocrApiKey.trim();
  if (!apiKey) {
    throw new OcrError(
      'OCR API key is missing. Set EXPO_PUBLIC_OCR_API_KEY in your .env.',
      'missing_key',
    );
  }

  const response = await fetch(`${VISION_ANNOTATE_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new OcrError(detail || `Vision request failed (${response.status}).`, 'http');
  }

  const body = (await response.json()) as VisionAnnotateResponse;
  return extractTextFromVisionResponse(body);
}
