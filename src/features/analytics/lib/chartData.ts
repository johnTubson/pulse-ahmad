import { dayKey, hourFromIso } from '@/lib/analytics/aggregation';
import { averageSpendByMoodBand, type MoodSpendPoint } from '@/lib/analytics/correlation';
import { isInDateRange, type DateRange } from '@/lib/analytics/period';
import { formatMoney } from '@/lib/currency/formatMoney';
import type { Expense, Mood } from '@/types/finance';

export { withMoods } from '@/lib/analytics/moodJoin';

export function filterMoodsByRange(moods: Mood[], range: DateRange): Mood[] {
  return moods.filter((mood) => isInDateRange(mood.createdAt, range));
}

/** Day-of-month for the primary x-axis row (e.g. `24`). */
function dayNumberLabel(isoDay: string): string {
  return String(Number(isoDay.slice(8, 10)));
}

/** Short month + day for range edges (e.g. `Jun 23`). */
export function rangeEdgeLabel(isoDay: string): string {
  const [year, month, day] = isoDay.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Inclusive calendar days from `start` to `end` (`YYYY-MM-DD`). */
export function eachDayInclusive(start: string, end: string): string[] {
  const days: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cursor <= last) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Indices that should show an x-axis label (~4–6 ticks including ends). */
export function sparseLabelIndices(length: number, maxLabels = 5): Set<number> {
  const shown = new Set<number>();
  if (length <= 0) return shown;
  if (length === 1) {
    shown.add(0);
    return shown;
  }

  const count = Math.min(maxLabels, length);
  for (let i = 0; i < count; i += 1) {
    const index = Math.round((i * (length - 1)) / (count - 1));
    shown.add(index);
  }
  return shown;
}

/**
 * Fills gaps so the line chart has a numeric value for every calendar day.
 * Known days keep their average; gaps are linearly interpolated; leading/trailing
 * empty days extend the nearest known value.
 */
export function fillMoodValues(raw: (number | null)[]): number[] {
  const n = raw.length;
  if (n === 0) return [];

  let first = -1;
  let last = -1;
  for (let i = 0; i < n; i += 1) {
    if (raw[i] != null) {
      first = i;
      break;
    }
  }
  for (let i = n - 1; i >= 0; i -= 1) {
    if (raw[i] != null) {
      last = i;
      break;
    }
  }
  if (first < 0 || last < 0) return [];

  const firstValue = raw[first];
  const lastValue = raw[last];
  if (firstValue == null || lastValue == null) return [];

  const result: number[] = Array.from({ length: n }, () => 0);

  for (let i = 0; i < first; i += 1) result[i] = firstValue;
  for (let i = last; i < n; i += 1) result[i] = lastValue;

  let i = first;
  while (i <= last) {
    const known = raw[i];
    if (known != null) {
      result[i] = known;
      i += 1;
      continue;
    }
    let j = i;
    while (j <= last && raw[j] == null) j += 1;
    const left = raw[i - 1];
    const right = raw[j];
    if (left == null || right == null) break;
    const span = j - (i - 1);
    for (let k = i; k < j; k += 1) {
      const t = (k - (i - 1)) / span;
      result[k] = left + (right - left) * t;
    }
    i = j;
  }

  return result;
}

export type MoodTrendSeries = {
  points: { value: number; label?: string }[];
  rangeStartLabel: string;
  rangeEndLabel: string;
};

/** Daily average mood series from the mood store (includes expense-linked moods). */
export function dailyMoodSeries(moods: Mood[], range: DateRange): MoodTrendSeries {
  const byDay = new Map<string, { sum: number; count: number }>();

  for (const mood of moods) {
    const key = dayKey(mood.createdAt);
    const current = byDay.get(key) ?? { sum: 0, count: 0 };
    current.sum += mood.value;
    current.count += 1;
    byDay.set(key, current);
  }

  const rangeStartLabel = rangeEdgeLabel(range.start);
  const rangeEndLabel = rangeEdgeLabel(range.end);

  if (byDay.size === 0) {
    return { points: [], rangeStartLabel, rangeEndLabel };
  }

  const days = eachDayInclusive(range.start, range.end);
  const raw = days.map((date) => {
    const entry = byDay.get(date);
    return entry ? entry.sum / entry.count : null;
  });
  const values = fillMoodValues(raw);
  if (values.length === 0) {
    return { points: [], rangeStartLabel, rangeEndLabel };
  }

  const labelAt = sparseLabelIndices(days.length);

  return {
    points: days.map((date, index) => ({
      value: values[index] ?? 0,
      label: labelAt.has(index) ? dayNumberLabel(date) : '',
    })),
    rangeStartLabel,
    rangeEndLabel,
  };
}

/** Summary copy for the By period mood line chart. Expects moods already filtered to the range. */
export function periodMoodChartCopy(moods: Mood[]): string {
  if (moods.length === 0) {
    return 'Log moods in this period to see your daily pattern.';
  }

  const average = moods.reduce((sum, mood) => sum + mood.value, 0) / moods.length;
  const uniqueDays = new Set(moods.map((mood) => dayKey(mood.createdAt))).size;

  if (average >= 4) {
    return `Your mood averaged ${average.toFixed(1)} across ${uniqueDays} day${uniqueDays === 1 ? '' : 's'} in this period.`;
  }
  if (average <= 2.5) {
    return `Your mood dipped to ${average.toFixed(1)} on average across ${uniqueDays} day${uniqueDays === 1 ? '' : 's'}.`;
  }
  return `Your mood held steady around ${average.toFixed(1)} across ${uniqueDays} day${uniqueDays === 1 ? '' : 's'}.`;
}

export type TopInsight =
  | { unlocked: false }
  | {
      unlocked: true;
      multiplierLabel: string;
      body: string;
      meta: [string, string];
    };

export function moodSpendChartCopy(points: MoodSpendPoint[]): {
  insight: TopInsight;
  summary: string;
} {
  if (points.length < 3) {
    return {
      insight: { unlocked: false },
      summary: 'No strong correlation detected yet — keep logging.',
    };
  }

  const bands = averageSpendByMoodBand(points);

  let summary: string;
  if (bands.lowMoodDays === 0 || bands.highMoodDays === 0) {
    summary = 'No strong correlation detected yet — keep logging.';
  } else if (Math.abs(bands.difference) < 1) {
    summary = 'Spending looks similar across moods so far.';
  } else if (bands.difference > 0) {
    summary = `Your spending increases by ${formatMoney(bands.difference)} on low mood days.`;
  } else {
    summary = `Your spending increases by ${formatMoney(Math.abs(bands.difference))} on high mood days.`;
  }

  if (points.length < 5 || bands.lowMoodDays === 0 || bands.highMoodAverage <= 0) {
    return { insight: { unlocked: false }, summary };
  }

  const ratio = bands.lowMoodAverage / bands.highMoodAverage;
  if (ratio < 1.15) {
    return { insight: { unlocked: false }, summary };
  }

  return {
    insight: {
      unlocked: true,
      multiplierLabel: `${ratio.toFixed(1)}x`,
      body: 'More spending when your mood is low.',
      meta: [
        `${bands.lowMoodDays} low-mood day${bands.lowMoodDays === 1 ? '' : 's'} in range`,
        `${bands.highMoodDays} high-mood day${bands.highMoodDays === 1 ? '' : 's'} compared`,
      ],
    },
    summary,
  };
}

/** Morning / afternoon / evening / 9pm+ spend buckets. */
export function spendByTimeOfDay(expenses: Expense[]): {
  label: string;
  value: number;
}[] {
  const buckets = [
    { label: 'Morning', value: 0 },
    { label: 'Afternoon', value: 0 },
    { label: 'Evening', value: 0 },
    { label: '9pm+', value: 0 },
  ];

  for (const expense of expenses) {
    const hour = hourFromIso(expense.date);
    if (hour < 0) continue;
    if (hour < 12) buckets[0].value += expense.amount;
    else if (hour < 17) buckets[1].value += expense.amount;
    else if (hour < 21) buckets[2].value += expense.amount;
    else buckets[3].value += expense.amount;
  }

  return buckets;
}

export function timeOfDaySummary(buckets: { label: string; value: number }[]): string {
  const top = [...buckets].sort((a, b) => b.value - a.value)[0];
  if (!top || top.value <= 0) return 'Log spends to see your time-of-day pattern.';
  return `You spend more in the ${top.label.toLowerCase()}.`;
}
