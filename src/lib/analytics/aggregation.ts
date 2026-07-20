import type { CategoryId, Expense } from '@/types/finance';

/** Sunday-first day-of-week labels, indexed by `Date.getDay()`. */
export const DAY_OF_WEEK_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type CategoryTotal = {
  categoryId: CategoryId;
  total: number;
  count: number;
  /** Share of the grand total, 0–100. */
  percentage: number;
};

export type DailyTotal = {
  /** Calendar day key, `YYYY-MM-DD`. */
  date: string;
  total: number;
  count: number;
};

export type DayOfWeekTotal = {
  /** 0 = Sunday … 6 = Saturday (matches `Date.getDay()`). */
  day: number;
  label: string;
  total: number;
  count: number;
  average: number;
};

/** Extracts the `YYYY-MM-DD` calendar key from an ISO timestamp. */
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Totals spend per category, sorted high → low, with each category's share of
 * the grand total. Powers the analytics donut / bar breakdown.
 */
export function aggregateByCategory(expenses: Expense[]): CategoryTotal[] {
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const buckets = new Map<CategoryId, { total: number; count: number }>();

  for (const expense of expenses) {
    const current = buckets.get(expense.categoryId) ?? { total: 0, count: 0 };
    current.total += expense.amount;
    current.count += 1;
    buckets.set(expense.categoryId, current);
  }

  return Array.from(buckets, ([categoryId, { total, count }]) => ({
    categoryId,
    total,
    count,
    percentage: grandTotal === 0 ? 0 : (total / grandTotal) * 100,
  })).sort((a, b) => b.total - a.total);
}

/**
 * Totals spend per calendar day, sorted chronologically. Days with no expenses
 * are omitted (callers that need a dense series should fill gaps themselves).
 */
export function getDailyTotals(expenses: Expense[]): DailyTotal[] {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const expense of expenses) {
    const key = dayKey(expense.date);
    const current = buckets.get(key) ?? { total: 0, count: 0 };
    current.total += expense.amount;
    current.count += 1;
    buckets.set(key, current);
  }

  return Array.from(buckets, ([date, { total, count }]) => ({ date, total, count })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

/**
 * Totals spend by weekday. Always returns all seven days (Sunday → Saturday)
 * so charts render a stable axis even for sparse data.
 */
export function aggregateByDayOfWeek(expenses: Expense[]): DayOfWeekTotal[] {
  const buckets = DAY_OF_WEEK_LABELS.map((label, day) => ({
    day,
    label,
    total: 0,
    count: 0,
  }));

  for (const expense of expenses) {
    const [year, month, day] = dayKey(expense.date).split('-').map(Number);
    // Construct from components so the weekday is stable regardless of timezone.
    const weekday = new Date(year, month - 1, day).getDay();
    const bucket = buckets[weekday];
    bucket.total += expense.amount;
    bucket.count += 1;
  }

  return buckets.map((bucket) => ({
    ...bucket,
    average: bucket.count === 0 ? 0 : bucket.total / bucket.count,
  }));
}
