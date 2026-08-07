import { create } from 'zustand';

export type OcrStatus = 'idle' | 'success' | 'failed';

type ScanDraftState = {
  receiptUri: string | null;
  ocrStatus: OcrStatus;
  /** Suggested amount from OCR; null when OCR failed or found nothing. */
  suggestedAmount: number | null;
  /** Monotonic token so LogForm can apply each new scan once. */
  scanToken: number;
  applyScan: (input: { receiptUri: string; amount: number | null }) => void;
  clearReceipt: () => void;
  reset: () => void;
};

export const useScanDraftStore = create<ScanDraftState>((set) => ({
  receiptUri: null,
  ocrStatus: 'idle',
  suggestedAmount: null,
  scanToken: 0,

  applyScan: ({ receiptUri, amount }) =>
    set((state) => ({
      receiptUri,
      suggestedAmount: amount,
      ocrStatus: amount != null ? 'success' : 'failed',
      scanToken: state.scanToken + 1,
    })),

  clearReceipt: () =>
    set({
      receiptUri: null,
      ocrStatus: 'idle',
      suggestedAmount: null,
    }),

  reset: () =>
    set({
      receiptUri: null,
      ocrStatus: 'idle',
      suggestedAmount: null,
      scanToken: 0,
    }),
}));
