import { formatTransactionDate, isCurrentMonth } from '@/lib/date/format';

describe('isCurrentMonth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for dates in the current month', () => {
    expect(isCurrentMonth('2026-07-03T00:00:00.000Z')).toBe(true);
  });

  it('returns false for dates in a different month', () => {
    expect(isCurrentMonth('2026-06-30T00:00:00.000Z')).toBe(false);
  });
});

describe('formatTransactionDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T14:30:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('prefixes today with "Today"', () => {
    const result = formatTransactionDate('2026-07-15T09:00:00');
    expect(result).toMatch(/^Today,/);
  });

  it('formats other dates without "Today"', () => {
    const result = formatTransactionDate('2026-06-10T09:00:00');
    expect(result).not.toContain('Today');
    expect(result).toContain('Jun');
    expect(result).toContain('10');
  });
});
