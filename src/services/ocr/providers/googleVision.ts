import { env } from '@/constants/env';
import {
  EMPTY_OCR_TEXT,
  OcrError,
  requireApiKey,
  textOnlyResult,
  throwIfHttpFailed,
  type RecognizeResult,
} from '@/services/ocr/types';

const VISION_ANNOTATE_URL = 'https://vision.googleapis.com/v1/images:annotate';

export type VisionAnnotateResponse = {
  responses?: {
    fullTextAnnotation?: { text?: string };
    textAnnotations?: { description?: string }[];
    error?: { code?: number; message?: string };
  }[];
  error?: { code?: number; message?: string };
};

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

  throw new OcrError(EMPTY_OCR_TEXT, 'empty');
}

/** Google Cloud Vision DOCUMENT_TEXT_DETECTION on raw base64 JPEG/PNG. */
export async function recognizeWithGoogleVision(base64Image: string): Promise<RecognizeResult> {
  const apiKey = requireApiKey(
    env.ocrApiKey,
    'OCR API key is missing. Set EXPO_PUBLIC_OCR_API_KEY in your .env.',
  );

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

  await throwIfHttpFailed(response, 'Vision');

  const body = (await response.json()) as VisionAnnotateResponse;
  return textOnlyResult(extractTextFromVisionResponse(body));
}
