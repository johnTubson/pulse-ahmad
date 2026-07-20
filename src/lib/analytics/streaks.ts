import { dayKey } from '@/lib/analytics/aggregation';

export type StreakResult = {
  /** Consecutive days logged ending today or yesterday (0 if the run is broken). */
  current: number;
  /** Longest consecutive-day run ever recorded. */
  longest: number;
  /** Calendar key (`YYYY-MM-DD`) of the most recent logged day, or null. */
  lastLoggedDate: string | null;
};

/**
 * Streak lifecycle used to drive the Home streak card copy:
 * - `active`   — logged today, streak safe
 * - `at-risk`  — logged yesterday, will break unless logged today
 * - `broken`   — last log is older than yesterday
 * - `none`     — nothing logged yet
 */
export type StreakStatus = 'active' | 'at-risk' | 'broken' | 'none';

/** Days since the Unix epoch for a `YYYY-MM-DD` key (timezone-independent). */
function dayNumberFromKey(key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** Days since the Unix epoch for a `Date`, using its local calendar date. */
function dayNumberFromDate(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * Computes current and longest logging streaks from a list of ISO timestamps.
 * Multiple entries on the same day count once. The current streak only counts
 * if the most recent logged day is today or yesterday relative to `today`.
 */
export function calculateStreak(dates: string[], today: Date = new Date()): StreakResult {
  const uniqueKeys = Array.from(new Set(dates.map(dayKey))).sort();

  if (uniqueKeys.length === 0) {
    return { current: 0, longest: 0, lastLoggedDate: null };
  }

  const dayNumbers = uniqueKeys.map(dayNumberFromKey);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dayNumbers.length; i += 1) {
    if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const todayNumber = dayNumberFromDate(today);
  const lastNumber = dayNumbers[dayNumbers.length - 1];

  let current = 0;
  if (lastNumber === todayNumber || lastNumber === todayNumber - 1) {
    current = 1;
    for (let i = dayNumbers.length - 1; i > 0; i -= 1) {
      if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return {
    current,
    longest,
    lastLoggedDate: uniqueKeys[uniqueKeys.length - 1],
  };
}

/** Maps a streak result to a status label for UI copy. */
export function getStreakStatus(result: StreakResult, today: Date = new Date()): StreakStatus {
  if (result.lastLoggedDate === null) {
    return 'none';
  }

  const lastNumber = dayNumberFromKey(result.lastLoggedDate);
  const todayNumber = dayNumberFromDate(today);

  if (lastNumber === todayNumber) {
    return 'active';
  }
  if (lastNumber === todayNumber - 1) {
    return 'at-risk';
  }
  return 'broken';
}
