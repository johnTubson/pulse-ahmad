export type BudgetStatus = 'under' | 'warning' | 'over';

export type BudgetProgress = {
  limit: number;
  spent: number;
  /** Amount left before hitting the limit (negative when overspent). */
  remaining: number;
  /** spent / limit (0 when the limit is not positive). */
  ratio: number;
  /** ratio × 100, rounded to a whole percent. */
  percentage: number;
  status: BudgetStatus;
};

export type BudgetProjection = {
  /** Average spend per elapsed day. */
  dailyPace: number;
  /** Estimated total spend by the end of the period. */
  projectedSpend: number;
  /** How far the projection exceeds the limit (0 when within budget). */
  projectedOverspend: number;
  willExceed: boolean;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Computes progress against a spending limit. `warningThreshold` (0–1) sets when
 * a budget flips from `under` to `warning` before it is actually exceeded.
 * A non-positive limit yields a zeroed, `under` result (no limit to breach).
 */
export function calculateBudgetProgress(
  spent: number,
  limit: number,
  warningThreshold = 0.8,
): BudgetProgress {
  if (limit <= 0) {
    return {
      limit,
      spent,
      remaining: -spent,
      ratio: 0,
      percentage: 0,
      status: 'under',
    };
  }

  const ratio = spent / limit;
  let status: BudgetStatus = 'under';
  if (spent > limit) {
    status = 'over';
  } else if (ratio >= warningThreshold) {
    status = 'warning';
  }

  return {
    limit,
    spent,
    remaining: round2(limit - spent),
    ratio: round2(ratio),
    percentage: Math.round(ratio * 100),
    status,
  };
}

/**
 * Projects end-of-period spend from the current pace. `dayOfPeriod` is the
 * number of elapsed days (1-based); `daysInPeriod` the total. Returns a zeroed
 * projection when inputs are non-positive.
 */
export function projectPeriodSpend(
  spent: number,
  dayOfPeriod: number,
  daysInPeriod: number,
  limit: number,
): BudgetProjection {
  if (dayOfPeriod <= 0 || daysInPeriod <= 0) {
    return { dailyPace: 0, projectedSpend: 0, projectedOverspend: 0, willExceed: false };
  }

  const dailyPace = spent / dayOfPeriod;
  const projectedSpend = round2(dailyPace * daysInPeriod);
  const projectedOverspend = limit > 0 ? Math.max(0, round2(projectedSpend - limit)) : 0;

  return {
    dailyPace: round2(dailyPace),
    projectedSpend,
    projectedOverspend,
    willExceed: limit > 0 && projectedSpend > limit,
  };
}

/**
 * Produces a warm, non-judgmental budget message (see product tone guide), or
 * null when there is nothing worth surfacing. `label` names the budget scope.
 */
export function getBudgetAlert(progress: BudgetProgress, label = 'budget'): string | null {
  switch (progress.status) {
    case 'over':
      return `You've gone past your ${label} for this period.`;
    case 'warning':
      return `You're at ${progress.percentage}% of your ${label}.`;
    default:
      return null;
  }
}
