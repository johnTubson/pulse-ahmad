export type RecognizeResult = {
  text: string;
  /** Structured amount when the provider returns one; otherwise null for parseAmount. */
  amount: number | null;
  merchant: string | null;
  /** Short expense note when the provider returns one; otherwise null. */
  note: string | null;
  /** ISO or freeform date string when the provider returns one; heuristics fill gaps. */
  date: string | null;
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

export const EMPTY_OCR_TEXT = 'No text found on this receipt.';

export function textOnlyResult(text: string): RecognizeResult {
  return { text, amount: null, merchant: null, note: null, date: null };
}

export function requireApiKey(value: string, missingMessage: string): string {
  const apiKey = value.trim();
  if (!apiKey) {
    throw new OcrError(missingMessage, 'missing_key');
  }
  return apiKey;
}

export function jpegDataUrl(base64Image: string): string {
  return `data:image/jpeg;base64,${base64Image}`;
}

/** Throws OcrError when the response is not OK. Optional per-status message overrides. */
export async function throwIfHttpFailed(
  response: Response,
  label: string,
  statusMessages?: Partial<Record<number, string>>,
): Promise<void> {
  if (response.ok) return;

  const override = statusMessages?.[response.status];
  if (override) {
    throw new OcrError(override, 'http');
  }

  const detail = await response.text().catch(() => '');
  throw new OcrError(detail || `${label} request failed (${response.status}).`, 'http');
}
