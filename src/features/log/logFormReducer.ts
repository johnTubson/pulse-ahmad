import type { CategoryId } from '@/types/finance';

export type LogFormState = {
  amount: string;
  categoryId: CategoryId | null;
  note: string;
  occurredAt: Date;
  savedExpenseId: string | null;
  moodVisible: boolean;
  scanVisible: boolean;
  saving: boolean;
  appliedScanToken: number;
};

export type LogFormAction =
  | { type: 'SET_AMOUNT'; amount: string }
  | { type: 'SET_CATEGORY'; categoryId: CategoryId }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'SET_OCCURRED_AT'; occurredAt: Date }
  | {
      type: 'APPLY_SCAN';
      token: number;
      amount: number | null;
      note?: string | null;
      occurredAt?: Date | null;
    }
  | { type: 'OPEN_SCAN_SHEET' }
  | { type: 'CLOSE_SCAN_SHEET' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; expenseId: string }
  | { type: 'SAVE_END' }
  | { type: 'CLOSE_MOOD' }
  | { type: 'RESET' };

export function formatAmountValue(amount: number): string {
  return amount
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');
}

export const initialLogFormState: LogFormState = {
  amount: '',
  categoryId: null,
  note: '',
  occurredAt: new Date(),
  savedExpenseId: null,
  moodVisible: false,
  scanVisible: false,
  saving: false,
  appliedScanToken: 0,
};

export function logFormReducer(state: LogFormState, action: LogFormAction): LogFormState {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount };
    case 'SET_CATEGORY':
      return { ...state, categoryId: action.categoryId };
    case 'SET_NOTE':
      return { ...state, note: action.note };
    case 'SET_OCCURRED_AT':
      return { ...state, occurredAt: action.occurredAt };
    case 'APPLY_SCAN':
      return {
        ...state,
        appliedScanToken: action.token,
        amount: action.amount != null ? formatAmountValue(action.amount) : state.amount,
        // suggestedNote is already trimmed in scanDraftStore.applyScan
        note: action.note && !state.note.trim() ? action.note : state.note,
        occurredAt:
          action.occurredAt && !Number.isNaN(action.occurredAt.getTime())
            ? action.occurredAt
            : state.occurredAt,
      };
    case 'OPEN_SCAN_SHEET':
      return { ...state, scanVisible: true };
    case 'CLOSE_SCAN_SHEET':
      return { ...state, scanVisible: false };
    case 'SAVE_START':
      return { ...state, saving: true };
    case 'SAVE_SUCCESS':
      return {
        ...state,
        saving: false,
        savedExpenseId: action.expenseId,
        moodVisible: true,
      };
    case 'SAVE_END':
      return { ...state, saving: false };
    case 'CLOSE_MOOD':
      return { ...state, moodVisible: false };
    case 'RESET':
      return {
        ...initialLogFormState,
        occurredAt: new Date(),
      };
    default:
      return state;
  }
}
