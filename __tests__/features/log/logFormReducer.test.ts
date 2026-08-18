import {
  formatAmountValue,
  initialLogFormState,
  logFormReducer,
} from '@/features/log/logFormReducer';

describe('formatAmountValue', () => {
  it('trims trailing zeros', () => {
    expect(formatAmountValue(24)).toBe('24');
    expect(formatAmountValue(24.5)).toBe('24.5');
    expect(formatAmountValue(24.56)).toBe('24.56');
  });
});

describe('logFormReducer', () => {
  it('applies a scan amount and token', () => {
    const next = logFormReducer(initialLogFormState, {
      type: 'APPLY_SCAN',
      token: 3,
      amount: 12.5,
    });
    expect(next.amount).toBe('12.5');
    expect(next.appliedScanToken).toBe(3);
  });

  it('keeps amount when scan finds nothing', () => {
    const seeded = logFormReducer(initialLogFormState, {
      type: 'SET_AMOUNT',
      amount: '9.99',
    });
    const next = logFormReducer(seeded, {
      type: 'APPLY_SCAN',
      token: 1,
      amount: null,
    });
    expect(next.amount).toBe('9.99');
    expect(next.appliedScanToken).toBe(1);
  });

  it('prefills note from merchant when note is empty', () => {
    const next = logFormReducer(initialLogFormState, {
      type: 'APPLY_SCAN',
      token: 4,
      amount: 4,
      note: 'Coffee Shop',
    });
    expect(next.note).toBe('Coffee Shop');
  });

  it('prefills occurredAt from scan date', () => {
    const when = new Date(2024, 2, 15, 12, 0, 0);
    const next = logFormReducer(initialLogFormState, {
      type: 'APPLY_SCAN',
      token: 6,
      amount: 8,
      occurredAt: when,
    });
    expect(next.occurredAt).toEqual(when);
  });

  it('keeps occurredAt when scan has no date', () => {
    const seeded = logFormReducer(initialLogFormState, {
      type: 'SET_OCCURRED_AT',
      occurredAt: new Date(2023, 0, 1),
    });
    const next = logFormReducer(seeded, {
      type: 'APPLY_SCAN',
      token: 7,
      amount: 1,
      occurredAt: null,
    });
    expect(next.occurredAt).toEqual(seeded.occurredAt);
  });

  it('does not overwrite an existing note with merchant', () => {
    const seeded = logFormReducer(initialLogFormState, {
      type: 'SET_NOTE',
      note: 'Already typed',
    });
    const next = logFormReducer(seeded, {
      type: 'APPLY_SCAN',
      token: 5,
      amount: 4,
      note: 'Coffee Shop',
    });
    expect(next.note).toBe('Already typed');
  });

  it('opens mood sheet after a successful save', () => {
    const next = logFormReducer(
      { ...initialLogFormState, saving: true },
      { type: 'SAVE_SUCCESS', expenseId: 'exp_1' },
    );
    expect(next.saving).toBe(false);
    expect(next.moodVisible).toBe(true);
    expect(next.savedExpenseId).toBe('exp_1');
  });

  it('resets fields while refreshing occurredAt', () => {
    const dirty = logFormReducer(
      {
        ...initialLogFormState,
        amount: '10',
        note: 'coffee',
        moodVisible: true,
        appliedScanToken: 2,
      },
      { type: 'RESET' },
    );
    expect(dirty.amount).toBe('');
    expect(dirty.note).toBe('');
    expect(dirty.moodVisible).toBe(false);
    expect(dirty.appliedScanToken).toBe(0);
    expect(dirty.occurredAt).toBeInstanceOf(Date);
  });
});
