import { averageSpendByMoodBand, toDailyMoodSpendPoints } from '@/lib/analytics/correlation';
import { calculateStreak } from '@/lib/analytics/streaks';
import { DEFAULT_CATEGORIES, generateSeedData } from '@/lib/mock/seedData';
import type { ExpenseWithMood } from '@/types/finance';

const END = new Date('2026-07-15T00:00:00Z');

describe('generateSeedData', () => {
  it('produces the 12 default categories', () => {
    const { categories } = generateSeedData({ endDate: END });
    expect(categories).toHaveLength(12);
    expect(categories).toBe(DEFAULT_CATEGORIES);
  });

  it('is deterministic for a fixed seed', () => {
    const a = generateSeedData({ seed: 7, days: 30, endDate: END });
    const b = generateSeedData({ seed: 7, days: 30, endDate: END });
    expect(a.expenses).toEqual(b.expenses);
    expect(a.moods).toEqual(b.moods);
  });

  it('covers roughly the requested number of days', () => {
    const { expenses } = generateSeedData({ days: 60, endDate: END });
    const uniqueDays = new Set(expenses.map((e) => e.date.slice(0, 10)));
    expect(uniqueDays.size).toBe(60);
    expect(expenses.length).toBeGreaterThan(60);
  });

  it('tags most (but not all) expenses with a mood', () => {
    const { expenses, moods } = generateSeedData({ days: 60, endDate: END });
    expect(moods.length).toBeGreaterThan(0);
    expect(moods.length).toBeLessThan(expenses.length);
  });

  it('bakes in a stress-spending pattern (spends more on low-mood days)', () => {
    const { expenses, moods } = generateSeedData({ days: 60, endDate: END });
    const moodByExpense = new Map(moods.map((m) => [m.expenseId, m.value]));
    const withMood: ExpenseWithMood[] = expenses.map((e) => ({
      ...e,
      mood: moodByExpense.get(e.id) ?? null,
    }));

    const band = averageSpendByMoodBand(toDailyMoodSpendPoints(withMood));
    expect(band.lowMoodAverage).toBeGreaterThan(band.highMoodAverage);
  });

  it('produces a continuous logging streak up to the end date', () => {
    const { expenses } = generateSeedData({ days: 60, endDate: END });
    const streak = calculateStreak(
      expenses.map((e) => e.date),
      END,
    );
    expect(streak.current).toBe(60);
  });
});
