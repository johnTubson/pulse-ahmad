import { firstNameFrom, greetingForHour } from '@/features/dashboard/lib/greeting';
import {
  getHomeInsight,
  getInsightProgress,
  INSIGHT_UNLOCK_DAYS,
} from '@/features/dashboard/lib/homeInsight';
import {
  averageDailySpendForWeekday,
  getTodayVsUsual,
} from '@/features/dashboard/lib/todaySummary';
import type { Expense, ExpenseWithMood } from '@/types/finance';

function expense(
  amount: number,
  date: string,
  categoryId: Expense['categoryId'] = 'other',
): Expense {
  return { id: `${date}-${amount}`, amount, date, categoryId };
}

describe('greetingForHour', () => {
  it('returns morning / afternoon / evening bands', () => {
    expect(greetingForHour(8)).toBe('Good morning');
    expect(greetingForHour(14)).toBe('Good afternoon');
    expect(greetingForHour(20)).toBe('Good evening');
  });
});

describe('firstNameFrom', () => {
  it('capitalizes the email local-part', () => {
    expect(firstNameFrom('alex@pulse.app')).toBe('Alex');
  });

  it('falls back when identity is missing', () => {
    expect(firstNameFrom(null)).toBe('there');
  });
});

describe('getInsightProgress', () => {
  it('tracks unique days toward unlock', () => {
    const expenses = [
      expense(10, '2026-07-01T12:00:00.000Z'),
      expense(20, '2026-07-01T18:00:00.000Z'),
      expense(15, '2026-07-02T12:00:00.000Z'),
    ];
    expect(getInsightProgress(expenses)).toEqual({
      loggedDays: 2,
      required: INSIGHT_UNLOCK_DAYS,
      unlocked: false,
    });
  });

  it('unlocks once the required unique days are reached', () => {
    const expenses = [
      expense(10, '2026-07-01T12:00:00.000Z'),
      expense(10, '2026-07-02T12:00:00.000Z'),
      expense(10, '2026-07-03T12:00:00.000Z'),
    ];
    expect(getInsightProgress(expenses).unlocked).toBe(true);
  });
});

describe('getHomeInsight', () => {
  it('returns null before unlock', () => {
    expect(getHomeInsight([expense(10, '2026-07-01T12:00:00.000Z')])).toBeNull();
  });

  it('returns a category insight after unlock', () => {
    const expenses: ExpenseWithMood[] = [
      { ...expense(40, '2026-07-01T12:00:00.000Z', 'delivery'), mood: null },
      { ...expense(10, '2026-07-02T12:00:00.000Z', 'transport'), mood: null },
      { ...expense(10, '2026-07-03T12:00:00.000Z', 'transport'), mood: null },
    ];
    const insight = getHomeInsight(expenses);
    expect(insight).not.toBeNull();
    expect(insight!.body).toMatch(/Delivery/i);
    expect(insight!.basis).toMatch(/Based on 3/);
  });
});

describe('getTodayVsUsual', () => {
  it('computes percent delta against prior same-weekday days', () => {
    // 2026-07-16 is a Thursday
    const today = new Date(2026, 6, 16, 12, 0, 0);
    const expenses = [
      expense(20, '2026-07-02T12:00:00.000Z'), // prior Thursday
      expense(30, '2026-07-09T12:00:00.000Z'), // prior Thursday
      expense(40, '2026-07-16T12:00:00.000Z'), // today
    ];

    const result = getTodayVsUsual(expenses, today);
    expect(result.todayTotal).toBe(40);
    expect(result.usualAverage).toBe(25);
    expect(result.percentDelta).toBe(60);
    expect(result.weekdayLabel).toBe('Thursday');
    expect(result.comparisonLabel).toMatch(/usual Thursday/);
  });

  it('averageDailySpendForWeekday ignores the excluded day', () => {
    const expenses = [
      expense(10, '2026-07-02T12:00:00.000Z'),
      expense(90, '2026-07-16T12:00:00.000Z'),
    ];
    expect(averageDailySpendForWeekday(expenses, 4, '2026-07-16')).toBe(10);
  });
});
