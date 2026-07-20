import { categoryLabels } from '@/constants/theme';
import { dayKey } from '@/lib/analytics/aggregation';
import { averageSpendByMoodBand, toDailyMoodSpendPoints } from '@/lib/analytics/correlation';
import type { ExpenseWithMood } from '@/types/finance';

export const INSIGHT_UNLOCK_DAYS = 3;

export type HomeInsight = {
  headline: string;
  body: string;
  basis: string;
};

export type InsightProgress = {
  loggedDays: number;
  required: number;
  unlocked: boolean;
};

export function getInsightProgress(
  expenses: { date: string }[],
  required: number = INSIGHT_UNLOCK_DAYS,
): InsightProgress {
  const loggedDays = new Set(expenses.map((e) => dayKey(e.date))).size;
  return {
    loggedDays,
    required,
    unlocked: loggedDays >= required,
  };
}

/**
 * Surfaces one Home insight from available data.
 * Prefers a mood-band spend comparison when enough tagged days exist;
 * otherwise falls back to this week's top category.
 */
export function getHomeInsight(expenses: ExpenseWithMood[]): HomeInsight | null {
  const progress = getInsightProgress(expenses);
  if (!progress.unlocked) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthExpenses = expenses.filter((e) => new Date(e.date) >= monthStart);
  const basisCount = monthExpenses.length > 0 ? monthExpenses.length : expenses.length;
  const basis = `Based on ${basisCount} logged expense${basisCount === 1 ? '' : 's'} this month`;

  const withMood = expenses.filter((e) => e.mood != null);
  const points = toDailyMoodSpendPoints(withMood);
  if (points.length >= 3) {
    const bands = averageSpendByMoodBand(points);
    if (bands.lowMoodDays > 0 && bands.highMoodDays > 0 && bands.highMoodAverage > 0) {
      const ratio = bands.lowMoodAverage / bands.highMoodAverage;
      if (ratio >= 1.1) {
        const pct = Math.round((ratio - 1) * 100);
        return {
          headline: "This week's insight",
          body: `You spend ${pct}% more overall on days you log as stressed.`,
          basis,
        };
      }
    }
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weekExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
  const pool = weekExpenses.length > 0 ? weekExpenses : expenses;

  const totals = new Map<string, number>();
  let grand = 0;
  for (const e of pool) {
    totals.set(e.categoryId, (totals.get(e.categoryId) ?? 0) + e.amount);
    grand += e.amount;
  }

  if (grand <= 0 || totals.size === 0) return null;

  const [topId, topTotal] = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0]!;
  const pct = Math.round((topTotal / grand) * 100);
  const label = categoryLabels[topId] ?? 'Other';

  return {
    headline: "This week's insight",
    body: `${label} made up ${pct}% of your spending this week.`,
    basis,
  };
}
