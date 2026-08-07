import { parseAmount } from '@/services/ocr/amountParser';
import { recognizeText } from '@/services/ocr/client';
import { prepareReceiptImage } from '@/services/ocr/prepareImage';

export type ScanReceiptResult = {
  /** Compressed local image URI to attach / upload. */
  imageUri: string;
  /** Raw OCR text (for debugging / future merchant parsing). */
  text: string;
  /** Best-guess total, or null when none found. */
  amount: number | null;
};

/**
 * Full receipt pipeline: compress → Vision OCR → amount heuristic.
 */
export async function scanReceipt(imageUri: string): Promise<ScanReceiptResult> {
  const prepared = await prepareReceiptImage(imageUri);
  const text = await recognizeText(prepared.base64);
  return {
    imageUri: prepared.uri,
    text,
    amount: parseAmount(text),
  };
}
