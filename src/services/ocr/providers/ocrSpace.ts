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

const DEFAULT_OCR_SPACE_URL = 'https://api.ocr.space/parse/image';

export type OcrSpaceParsedResult = {
  ParsedText?: string | null;
  FileParseExitCode?: number | string;
  ErrorMessage?: string | string[] | null;
  ErrorDetails?: string | null;
};

export type OcrSpaceResponse = {
  ParsedResults?: OcrSpaceParsedResult[] | null;
  OCRExitCode?: number | string;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[] | null;
  ErrorDetails?: string | null;
};

function formatErrorMessage(message: string | string[] | null | undefined): string | null {
  if (message == null) return null;
  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).join(' ').trim();
    return joined || null;
  }
  const trimmed = message.trim();
  return trimmed || null;
}

function toExitCode(value: number | string | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Joins successful page texts from an OCR.space JSON body.
 * OCRExitCode 1 = all pages ok, 2 = partial success (still usable).
 */
export function extractTextFromOcrSpaceResponse(body: OcrSpaceResponse): string {
  const topError = formatErrorMessage(body.ErrorMessage);
  if (body.IsErroredOnProcessing && topError) {
    throw new OcrError(topError, 'api');
  }

  const exit = toExitCode(body.OCRExitCode);
  if (exit != null && exit !== 1 && exit !== 2) {
    throw new OcrError(
      topError || formatErrorMessage(body.ErrorDetails) || `OCR.space failed (exit ${exit}).`,
      'api',
    );
  }

  const pages = body.ParsedResults ?? [];
  const texts: string[] = [];

  for (const page of pages) {
    const pageExit = toExitCode(page.FileParseExitCode);
    if (pageExit != null && pageExit !== 1) continue;
    const text = page.ParsedText?.trim();
    if (text) texts.push(text);
  }

  if (texts.length === 0) {
    const pageError = pages
      .map((p) => formatErrorMessage(p.ErrorMessage) ?? p.ErrorDetails?.trim())
      .find(Boolean);
    throw new OcrError(pageError || EMPTY_OCR_TEXT, 'empty');
  }

  return texts.join('\n\n');
}

/** OCR.space parse/image with Engine 2 + receipt-oriented flags. */
export async function recognizeWithOcrSpace(base64Image: string): Promise<RecognizeResult> {
  const apiKey = requireApiKey(
    env.ocrSpaceApiKey,
    'OCR.space API key is missing. Set EXPO_PUBLIC_OCR_SPACE_API_KEY in your .env.',
  );

  const endpoint = env.ocrSpaceUrl.trim() || DEFAULT_OCR_SPACE_URL;
  const form = new FormData();
  form.append('base64Image', jpegDataUrl(base64Image));
  form.append('language', 'auto');
  form.append('OCREngine', '2');
  form.append('isTable', 'true');
  form.append('scale', 'true');
  form.append('detectOrientation', 'true');
  form.append('filetype', 'JPG');
  form.append('isOverlayRequired', 'false');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { apikey: apiKey },
    body: form,
  });

  await throwIfHttpFailed(response, 'OCR.space', {
    413: 'Receipt image is too large for OCR.space (free plan max 1 MB). Try a closer crop.',
  });

  const body = (await response.json()) as OcrSpaceResponse;
  return textOnlyResult(extractTextFromOcrSpaceResponse(body));
}
