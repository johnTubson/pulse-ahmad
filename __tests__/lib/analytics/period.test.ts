import {
  daysInRange,
  filterExpensesByRange,
  formatDeltaPercent,
  percentChange,
  previousPeriodRange,
  resolvePeriodRange,
  sumExpenses,
} from '@/lib/analytics/period';
import type { Expense } from '@/types/finance';

function expense(partial: Partial<Expense> & { amount: number; date: string }): Expense {
  return {
    id: partial.id ?? Math.random().toString(36),
    categoryId: partial.categoryId ?? 'other',
    amount: partial.amount,
    date: partial.date,
    note: partial.note,
  };
}

describe('resolvePeriodRange', () => {
  const now = new Date(2026, 6, 22); // Jul 22, 2026 local

  it('resolves week as the last 7 inclusive days', () => {
    const range = resolvePeriodRange('week', now);
    expect(range.start).toBe('2026-07-16');
    expect(range.end).toBe('2026-07-22');
  });

  it('resolves month from the 1st through today', () => {
    const range = resolvePeriodRange('month', now);
    expect(range.start).toBe('2026-07-01');
    expect(range.end).toBe('2026-07-22');
    expect(range.label).toContain('Jul');
  });

  it('resolves threeMonth from two months prior on the 1st', () => {
    const range = resolvePeriodRange('threeMonth', now);
    expect(range.start).toBe('2026-05-01');
    expect(range.end).toBe('2026-07-22');
  });

  it('resolves allTime from earliest expense through today', () => {
    const range = resolvePeriodRange('allTime', now, '2026-01-15');
    expect(range.start).toBe('2026-01-15');
    expect(range.end).toBe('2026-07-22');
    expect(range.label).toBe('All time');
  });

  it('formats month range in Figma style', () => {
    const range = resolvePeriodRange('month', new Date(2026, 5, 30));
    expect(range.label).toBe('1st June - 30th June');
  });
});

describe('previousPeriodRange', () => {
  it('shifts back by the same day count', () => {
    const current = resolvePeriodRange('week', new Date(2026, 6, 22));
    const prev = previousPeriodRange(current, 'week');
    if (!prev) throw new Error('expected previous range');
    expect(prev.start).toBe('2026-07-09');
    expect(prev.end).toBe('2026-07-15');
    expect(daysInRange(prev)).toBe(daysInRange(current));
  });

  it('returns null for all-time', () => {
    const current = resolvePeriodRange('allTime', new Date(2026, 6, 22), '2026-01-01');
    expect(previousPeriodRange(current, 'allTime')).toBeNull();
  });
});

describe('filterExpensesByRange / metrics helpers', () => {
  const expenses = [
    expense({ amount: 10, date: '2026-07-01T12:00:00.000Z' }),
    expense({ amount: 20, date: '2026-07-15T12:00:00.000Z' }),
    expense({ amount: 5, date: '2026-06-30T12:00:00.000Z' }),
  ];

  it('filters inclusively by day key', () => {
    const range = { start: '2026-07-01', end: '2026-07-22', label: 'Jul' };
    expect(filterExpensesByRange(expenses, range)).toHaveLength(2);
    expect(sumExpenses(filterExpensesByRange(expenses, range))).toBe(30);
  });

  it('computes percent change and guards divide-by-zero', () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(80, 100)).toBe(-20);
    expect(percentChange(50, 0)).toBeNull();
    expect(percentChange(0, 0)).toBe(0);
  });

  it('formats delta percent for display', () => {
    expect(formatDeltaPercent(20)).toBe('+20%');
    expect(formatDeltaPercent(-5)).toBe('-5%');
    expect(formatDeltaPercent(0)).toBe('0%');
    expect(formatDeltaPercent(null)).toBe('—');
  });
});
