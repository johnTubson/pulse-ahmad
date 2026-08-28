import { dayKey } from '@/lib/analytics/aggregation';
import { formatMoney } from '@/lib/currency/formatMoney';
import type { Expense } from '@/types/finance';

export type AnalyticsPeriod = 'week' | 'month' | 'threeMonth' | 'allTime';

export const ANALYTICS_PERIOD_OPTIONS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'threeMonth', label: '3 Month' },
  { id: 'allTime', label: 'All-time' },
];

export type DateRange = {
  /** Inclusive start, `YYYY-MM-DD`. */
  start: string;
  /** Inclusive end, `YYYY-MM-DD`. */
  end: string;
  label: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long' });
}

function ordinalDay(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Figma-style range label, e.g. `1st June - 30th June`. */
export function formatRangeLabel(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameYear) {
    return `${ordinalDay(start.getDate())} ${monthName(start)} - ${ordinalDay(end.getDate())} ${monthName(end)}`;
  }

  return `${ordinalDay(start.getDate())} ${monthName(start)} ${start.getFullYear()} - ${ordinalDay(end.getDate())} ${monthName(end)} ${end.getFullYear()}`;
}

export function earliestExpenseDay(expenses: Expense[]): string | undefined {
  if (expenses.length === 0) return undefined;
  return expenses.reduce((min, expense) => {
    const key = dayKey(expense.date);
    return key < min ? key : min;
  }, dayKey(expenses[0].date));
}

export function isInDateRange(iso: string, range: DateRange): boolean {
  const key = dayKey(iso);
  return key >= range.start && key <= range.end;
}

/** Resolves the inclusive calendar range for an analytics period chip. */
export function resolvePeriodRangeForExpenses(
  period: AnalyticsPeriod,
  expenses: Expense[],
  now: Date = new Date(),
): DateRange {
  return resolvePeriodRange(period, now, earliestExpenseDay(expenses));
}

export function resolvePeriodRange(
  period: AnalyticsPeriod,
  now: Date = new Date(),
  earliestDay?: string,
): DateRange {
  const end = startOfDay(now);
  let start: Date;

  switch (period) {
    case 'week':
      start = addDays(end, -6);
      break;
    case 'threeMonth':
      start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
      break;
    case 'allTime': {
      if (earliestDay) {
        const [y, m, d] = earliestDay.split('-').map(Number);
        start = new Date(y, m - 1, d);
      } else {
        start = end;
      }
      return {
        start: toDayKey(start),
        end: toDayKey(end),
        label: 'All time',
      };
    }
    case 'month':
    default:
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
  }

  return {
    start: toDayKey(start),
    end: toDayKey(end),
    label: formatRangeLabel(start, end),
  };
}

/** Previous range of the same length, ending the day before `range.start`. Null for all-time. */
export function previousPeriodRange(range: DateRange, period: AnalyticsPeriod): DateRange | null {
  if (period === 'allTime') return null;

  const [sy, sm, sd] = range.start.split('-').map(Number);
  const [ey, em, ed] = range.end.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(dayCount - 1));
  return {
    start: toDayKey(prevStart),
    end: toDayKey(prevEnd),
    label: formatRangeLabel(prevStart, prevEnd),
  };
}

export function filterExpensesByRange(expenses: Expense[], range: DateRange): Expense[] {
  return expenses.filter((expense) => isInDateRange(expense.date, range));
}

/** Inclusive calendar-day count for a range. */
export function daysInRange(range: DateRange): number {
  const [sy, sm, sd] = range.start.split('-').map(Number);
  const [ey, em, ed] = range.end.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Percent change vs previous period. `null` when the previous total is 0
 * (avoid fake ∞% — callers show an em dash).
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function formatDeltaPercent(delta: number | null): string {
  if (delta == null) return '—';
  if (delta === 0) return '0%';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}%`;
}

export function formatAvgPerDay(total: number, dayCount: number): string {
  if (dayCount <= 0) return formatMoney(0);
  return formatMoney(total / dayCount);
}

export function periodHeroLabel(period: AnalyticsPeriod): string {
  switch (period) {
    case 'week':
      return 'this week';
    case 'threeMonth':
      return 'last 3 months';
    case 'allTime':
      return 'all time';
    case 'month':
    default:
      return 'this month';
  }
}

export function vsPriorLabel(period: AnalyticsPeriod): string {
  switch (period) {
    case 'week':
      return 'vs last week';
    case 'threeMonth':
      return 'vs prior 3 mo';
    case 'allTime':
      return 'vs prior period';
    case 'month':
    default:
      return 'vs last month';
  }
}
