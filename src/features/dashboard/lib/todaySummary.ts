import { dayKey } from '@/lib/analytics/aggregation';
import { formatMoney } from '@/lib/currency/formatMoney';
import type { Expense } from '@/types/finance';

export type TodayVsUsual = {
  todayTotal: number;
  usualAverage: number;
  /** Percent delta vs usual; null when there is no baseline. */
  percentDelta: number | null;
  weekdayLabel: string;
  comparisonLabel: string | null;
};

const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function averageDailySpendForWeekday(
  expenses: Expense[],
  weekday: number,
  excludeDayKey?: string,
): number {
  const byDay = new Map<string, number>();

  for (const expense of expenses) {
    const key = dayKey(expense.date);
    if (excludeDayKey && key === excludeDayKey) continue;

    const [year, month, day] = key.split('-').map(Number);
    if (new Date(year, month - 1, day).getDay() !== weekday) continue;

    byDay.set(key, (byDay.get(key) ?? 0) + expense.amount);
  }

  if (byDay.size === 0) return 0;
  let sum = 0;
  for (const total of byDay.values()) sum += total;
  return sum / byDay.size;
}

export function getTodayVsUsual(expenses: Expense[], today: Date = new Date()): TodayVsUsual {
  const todayKey = dayKey(today.toISOString());
  const weekday = today.getDay();
  const weekdayLabel = WEEKDAY_LABELS[weekday]!;

  const todayTotal = expenses
    .filter((e) => dayKey(e.date) === todayKey)
    .reduce((sum, e) => sum + e.amount, 0);

  const usualAverage = averageDailySpendForWeekday(expenses, weekday, todayKey);

  if (usualAverage <= 0) {
    return {
      todayTotal,
      usualAverage: 0,
      percentDelta: null,
      weekdayLabel,
      comparisonLabel: null,
    };
  }

  const percentDelta = Math.round(((todayTotal - usualAverage) / usualAverage) * 100);

  return {
    todayTotal,
    usualAverage,
    percentDelta,
    weekdayLabel,
    comparisonLabel: `vs ${formatMoney(usualAverage)} on a usual ${weekdayLabel}`,
  };
}
