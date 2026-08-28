import { parseAmount } from '@/services/ocr/amountParser';
import { prepareReceiptImage } from '@/services/ocr/prepareImage';
import { parseMerchant, parseReceiptDate } from '@/services/ocr/receiptHeuristics';
import { recognizeReceipt } from '@/services/ocr/recognizeReceipt';
import type { CategoryId } from '@/types/finance';

export type ScanReceiptResult = {
  imageUri: string;
  text: string;
  amount: number | null;
  merchant: string | null;
  /** Structured note when present; otherwise merchant for the log form. */
  note: string | null;
  /** Parsed purchase date when OCR or heuristics find one. */
  date: Date | null;
  categoryId: CategoryId | null;
};

/** Compress → provider OCR → amount / merchant / note / date (structured or heuristic). */
export async function scanReceipt(imageUri: string): Promise<ScanReceiptResult> {
  const prepared = await prepareReceiptImage(imageUri);
  const recognized = await recognizeReceipt(prepared.base64);
  const amount = recognized.amount ?? parseAmount(recognized.text);
  const merchant = recognized.merchant?.trim() || parseMerchant(recognized.text);
  const note = recognized.note?.trim() || merchant;

  let date: Date | null = null;
  if (recognized.date?.trim()) {
    const parsed = new Date(recognized.date);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }
  date ??= parseReceiptDate(recognized.text);

  return {
    imageUri: prepared.uri,
    text: recognized.text,
    amount,
    merchant,
    note,
    date,
    categoryId: recognized.categoryId,
  };
}
