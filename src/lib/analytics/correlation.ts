import { dayKey } from '@/lib/analytics/aggregation';
import type { CategoryId, ExpenseWithMood } from '@/types/finance';

export type CorrelationStrength = 'none' | 'weak' | 'moderate' | 'strong';
export type CorrelationDirection = 'positive' | 'negative' | 'none';

export type CorrelationResult = {
  /** Pearson r in [-1, 1], or null when it cannot be computed. */
  coefficient: number | null;
  strength: CorrelationStrength;
  direction: CorrelationDirection;
  /** Number of paired data points used. */
  sampleSize: number;
};

/** A single day's average mood paired with that day's total spend. */
export type MoodSpendPoint = { mood: number; spend: number };

export type MoodBandSummary = {
  /** Mean spend on low-mood days (average mood ≤ 2). */
  lowMoodAverage: number;
  /** Mean spend on high-mood days (average mood ≥ 4). */
  highMoodAverage: number;
  /** `lowMoodAverage - highMoodAverage` (positive ⇒ spends more when low). */
  difference: number;
  lowMoodDays: number;
  highMoodDays: number;
};

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Pearson correlation coefficient between two equal-length series.
 * Returns null when fewer than two points exist or either series is constant
 * (zero variance ⇒ correlation is undefined, not zero).
 */
export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length) {
    throw new Error('pearson: input series must have equal length');
  }
  const n = xs.length;
  if (n < 2) {
    return null;
  }

  const meanX = mean(xs);
  const meanY = mean(ys);

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  const denominator = Math.sqrt(varianceX * varianceY);
  if (denominator === 0) {
    return null;
  }

  const r = covariance / denominator;
  return Math.max(-1, Math.min(1, r));
}

/** Classifies |r| into a qualitative strength band. */
export function classifyStrength(coefficient: number | null): CorrelationStrength {
  if (coefficient === null) {
    return 'none';
  }
  const magnitude = Math.abs(coefficient);
  if (magnitude < 0.1) return 'none';
  if (magnitude < 0.3) return 'weak';
  if (magnitude < 0.5) return 'moderate';
  return 'strong';
}

function classifyDirection(coefficient: number | null): CorrelationDirection {
  if (coefficient === null || coefficient === 0) return 'none';
  return coefficient > 0 ? 'positive' : 'negative';
}

/** Correlates daily mood against daily spend across a set of points. */
export function moodSpendCorrelation(points: MoodSpendPoint[]): CorrelationResult {
  const coefficient = pearson(
    points.map((p) => p.mood),
    points.map((p) => p.spend),
  );

  return {
    coefficient,
    strength: classifyStrength(coefficient),
    direction: classifyDirection(coefficient),
    sampleSize: points.length,
  };
}

/**
 * Collapses expenses into one `MoodSpendPoint` per calendar day: the day's
 * average mood (across tagged expenses) against the day's total spend. Days with
 * no mood tags are excluded, since they carry no correlation signal.
 */
export function toDailyMoodSpendPoints(expenses: ExpenseWithMood[]): MoodSpendPoint[] {
  const byDay = new Map<string, { spend: number; moodSum: number; moodCount: number }>();

  for (const expense of expenses) {
    const key = dayKey(expense.date);
    const current = byDay.get(key) ?? { spend: 0, moodSum: 0, moodCount: 0 };
    current.spend += expense.amount;
    if (expense.mood != null) {
      current.moodSum += expense.mood;
      current.moodCount += 1;
    }
    byDay.set(key, current);
  }

  const points: MoodSpendPoint[] = [];
  for (const { spend, moodSum, moodCount } of byDay.values()) {
    if (moodCount > 0) {
      points.push({ mood: moodSum / moodCount, spend });
    }
  }
  return points;
}

/**
 * Compares average daily spend on low-mood days vs high-mood days — the core
 * evidence behind "you spend more when you feel worse" style insights.
 */
export function averageSpendByMoodBand(points: MoodSpendPoint[]): MoodBandSummary {
  const lowSpends = points.filter((p) => p.mood <= 2).map((p) => p.spend);
  const highSpends = points.filter((p) => p.mood >= 4).map((p) => p.spend);

  const lowMoodAverage = lowSpends.length === 0 ? 0 : mean(lowSpends);
  const highMoodAverage = highSpends.length === 0 ? 0 : mean(highSpends);

  return {
    lowMoodAverage,
    highMoodAverage,
    difference: lowMoodAverage - highMoodAverage,
    lowMoodDays: lowSpends.length,
    highMoodDays: highSpends.length,
  };
}

/** Per-category mood × spend correlation, sorted strongest → weakest. */
export function correlationByCategory(
  expenses: ExpenseWithMood[],
): { categoryId: CategoryId; correlation: CorrelationResult }[] {
  const byCategory = new Map<CategoryId, ExpenseWithMood[]>();
  for (const expense of expenses) {
    const list = byCategory.get(expense.categoryId) ?? [];
    list.push(expense);
    byCategory.set(expense.categoryId, list);
  }

  return Array.from(byCategory, ([categoryId, categoryExpenses]) => ({
    categoryId,
    correlation: moodSpendCorrelation(toDailyMoodSpendPoints(categoryExpenses)),
  })).sort((a, b) => {
    const aValue = a.correlation.coefficient ?? 0;
    const bValue = b.correlation.coefficient ?? 0;
    return Math.abs(bValue) - Math.abs(aValue);
  });
}
