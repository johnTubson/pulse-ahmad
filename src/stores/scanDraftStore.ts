import { create } from 'zustand';

export type OcrStatus = 'idle' | 'success' | 'failed';

type ScanDraftState = {
  receiptUri: string | null;
  ocrStatus: OcrStatus;
  /** Suggested amount from OCR; null when OCR failed or found nothing. */
  suggestedAmount: number | null;
  /** Suggested note (e.g. merchant); null when none. */
  suggestedNote: string | null;
  /** Suggested purchase date ISO; null when none. */
  suggestedDate: string | null;
  /** Monotonic token so LogForm can apply each new scan once. */
  scanToken: number;
  applyScan: (input: {
    receiptUri: string;
    amount: number | null;
    note?: string | null;
    date?: Date | null;
  }) => void;
  clearReceipt: () => void;
  reset: () => void;
};

export const useScanDraftStore = create<ScanDraftState>((set) => ({
  receiptUri: null,
  ocrStatus: 'idle',
  suggestedAmount: null,
  suggestedNote: null,
  suggestedDate: null,
  scanToken: 0,

  applyScan: ({ receiptUri, amount, note, date }) =>
    set((state) => ({
      receiptUri,
      suggestedAmount: amount,
      suggestedNote: note?.trim() || null,
      suggestedDate: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
      ocrStatus: amount != null ? 'success' : 'failed',
      scanToken: state.scanToken + 1,
    })),

  clearReceipt: () =>
    set({
      receiptUri: null,
      ocrStatus: 'idle',
      suggestedAmount: null,
      suggestedNote: null,
      suggestedDate: null,
    }),

  reset: () =>
    set({
      receiptUri: null,
      ocrStatus: 'idle',
      suggestedAmount: null,
      suggestedNote: null,
      suggestedDate: null,
      scanToken: 0,
    }),
}));
