import {
  aggregateByCategory,
  aggregateByDayOfWeek,
  dayKey,
  getDailyTotals,
} from '@/lib/analytics/aggregation';
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

describe('dayKey', () => {
  it('extracts the calendar day from an ISO timestamp', () => {
    expect(dayKey('2026-07-15T14:30:00.000Z')).toBe('2026-07-15');
  });
});

describe('aggregateByCategory', () => {
  it('returns an empty array for no expenses', () => {
    expect(aggregateByCategory([])).toEqual([]);
  });

  it('sums totals and counts per category', () => {
    const result = aggregateByCategory([
      expense({ amount: 100, categoryId: 'groceries', date: '2026-07-01T10:00:00Z' }),
      expense({ amount: 50, categoryId: 'groceries', date: '2026-07-02T10:00:00Z' }),
      expense({ amount: 200, categoryId: 'transport', date: '2026-07-02T10:00:00Z' }),
    ]);

    expect(result).toHaveLength(2);
    const groceries = result.find((r) => r.categoryId === 'groceries')!;
    expect(groceries.total).toBe(150);
    expect(groceries.count).toBe(2);
  });

  it('sorts categories from highest to lowest spend', () => {
    const result = aggregateByCategory([
      expense({ amount: 10, categoryId: 'groceries', date: '2026-07-01T10:00:00Z' }),
      expense({ amount: 90, categoryId: 'transport', date: '2026-07-01T10:00:00Z' }),
    ]);
    expect(result[0].categoryId).toBe('transport');
    expect(result[1].categoryId).toBe('groceries');
  });

  it('computes each category share as a percentage of the grand total', () => {
    const result = aggregateByCategory([
      expense({ amount: 75, categoryId: 'groceries', date: '2026-07-01T10:00:00Z' }),
      expense({ amount: 25, categoryId: 'transport', date: '2026-07-01T10:00:00Z' }),
    ]);
    expect(result.find((r) => r.categoryId === 'groceries')!.percentage).toBe(75);
    expect(result.find((r) => r.categoryId === 'transport')!.percentage).toBe(25);
  });

  it('reports 0% when the grand total is zero', () => {
    const result = aggregateByCategory([
      expense({ amount: 0, categoryId: 'groceries', date: '2026-07-01T10:00:00Z' }),
    ]);
    expect(result[0].percentage).toBe(0);
  });
});

describe('getDailyTotals', () => {
  it('groups expenses by calendar day and sorts chronologically', () => {
    const result = getDailyTotals([
      expense({ amount: 30, date: '2026-07-03T10:00:00Z' }),
      expense({ amount: 20, date: '2026-07-01T10:00:00Z' }),
      expense({ amount: 10, date: '2026-07-01T22:00:00Z' }),
    ]);

    expect(result).toEqual([
      { date: '2026-07-01', total: 30, count: 2 },
      { date: '2026-07-03', total: 30, count: 1 },
    ]);
  });

  it('returns an empty array for no expenses', () => {
    expect(getDailyTotals([])).toEqual([]);
  });
});

describe('aggregateByDayOfWeek', () => {
  it('always returns all seven days', () => {
    const result = aggregateByDayOfWeek([]);
    expect(result).toHaveLength(7);
    expect(result.map((r) => r.label)).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
    expect(result.every((r) => r.total === 0 && r.count === 0 && r.average === 0)).toBe(true);
  });

  it('buckets spend into the correct weekday and averages it', () => {
    // 2026-07-01 is a Wednesday, 2026-07-04 is a Saturday.
    const result = aggregateByDayOfWeek([
      expense({ amount: 100, date: '2026-07-01T10:00:00Z' }),
      expense({ amount: 40, date: '2026-07-01T18:00:00Z' }),
      expense({ amount: 60, date: '2026-07-04T18:00:00Z' }),
    ]);

    const wednesday = result[3];
    expect(wednesday.label).toBe('Wednesday');
    expect(wednesday.total).toBe(140);
    expect(wednesday.count).toBe(2);
    expect(wednesday.average).toBe(70);

    const saturday = result[6];
    expect(saturday.total).toBe(60);
    expect(saturday.average).toBe(60);
  });
});
