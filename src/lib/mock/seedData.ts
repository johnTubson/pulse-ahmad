/**
 * Deterministic seed generator for local mock mode and algorithm tests.
 *
 * Patterns baked in so analytics has something meaningful to surface:
 *   - Stress spending: low-mood days skew toward higher delivery / eating-out spend.
 *   - Late-night spikes: a share of expenses land after 9pm.
 *   - Social weekends: weekends lean toward eating-out and entertainment.
 */
import type { CategoryId, Expense, Mood, MoodValue } from '@/types/finance';

export type SeedCategory = {
  id: CategoryId;
  name: string;
  icon: string;
  colour: string;
  sortOrder: number;
};

export type SeedData = {
  categories: SeedCategory[];
  expenses: Expense[];
  moods: Mood[];
};

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { id: 'groceries', name: 'Food & Groceries', icon: '🛒', colour: '#0d9488', sortOrder: 0 },
  { id: 'eating-out', name: 'Eating Out', icon: '🍽️', colour: '#f97316', sortOrder: 1 },
  { id: 'delivery', name: 'Delivery', icon: '🛵', colour: '#ec4899', sortOrder: 2 },
  { id: 'transport', name: 'Transport', icon: '🚗', colour: '#3b82f6', sortOrder: 3 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', colour: '#8b5cf6', sortOrder: 4 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', colour: '#f59e0b', sortOrder: 5 },
  { id: 'bills', name: 'Bills & Utilities', icon: '💡', colour: '#6366f1', sortOrder: 6 },
  { id: 'health', name: 'Health', icon: '💊', colour: '#10b981', sortOrder: 7 },
  { id: 'education', name: 'Education', icon: '📚', colour: '#14b8a6', sortOrder: 8 },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', colour: '#e879f9', sortOrder: 9 },
  { id: 'savings', name: 'Savings & Investment', icon: '🏦', colour: '#64748b', sortOrder: 10 },
  { id: 'other', name: 'Other', icon: '➕', colour: '#94a3b8', sortOrder: 11 },
];

/** Deterministic PRNG (mulberry32) so generated data is reproducible. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export type SeedOptions = {
  days?: number;
  seed?: number;
  /** End date of the generated range (inclusive). Defaults to "now". */
  endDate?: Date;
};

/**
 * Builds a patterned seed dataset. Pure and deterministic for a given seed.
 */
export function generateSeedData(options: SeedOptions = {}): SeedData {
  const days = options.days ?? 60;
  const rng = createRng(options.seed ?? 42);
  const end = options.endDate ?? new Date();
  const endMidnight = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  const expenses: Expense[] = [];
  const moods: Mood[] = [];
  let counter = 0;

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset -= 1) {
    const dayStart = endMidnight - dayOffset * 86_400_000;
    const date = new Date(dayStart);
    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    // Weekly mood rhythm: dips midweek (Wed = 3), lifts on weekends.
    const baseMood = isWeekend ? 4 : weekday === 3 ? 2 : 3;
    const dayMood = Math.min(5, Math.max(1, baseMood + randomInt(rng, -1, 1))) as MoodValue;

    const expenseCount = randomInt(rng, 1, isWeekend ? 4 : 3);

    for (let i = 0; i < expenseCount; i += 1) {
      counter += 1;

      let categoryId: CategoryId;
      if (dayMood <= 2 && rng() < 0.6) {
        categoryId = pick(rng, ['delivery', 'eating-out'] as CategoryId[]);
      } else if (isWeekend && rng() < 0.5) {
        categoryId = pick(rng, ['eating-out', 'entertainment'] as CategoryId[]);
      } else {
        categoryId = pick(rng, [
          'groceries',
          'transport',
          'shopping',
          'bills',
          'health',
          'other',
        ] as CategoryId[]);
      }

      const moodMultiplier = dayMood <= 2 ? 1.8 : dayMood >= 4 ? 1.1 : 1;
      const baseAmount = randomInt(rng, 8, 60);
      const amount = round2(baseAmount * moodMultiplier);

      const hour = rng() < 0.25 ? randomInt(rng, 21, 23) : randomInt(rng, 8, 20);
      const timestamp = new Date(dayStart + hour * 3_600_000).toISOString();

      const expense: Expense = {
        id: `seed-exp-${counter}`,
        amount,
        categoryId,
        date: timestamp,
        note: '',
      };
      expenses.push(expense);

      if (rng() < 0.8) {
        moods.push({
          id: `seed-mood-${counter}`,
          expenseId: expense.id,
          value: dayMood,
          createdAt: new Date(dayStart + hour * 3_600_000 + 60_000).toISOString(),
        });
      }
    }
  }

  return { categories: DEFAULT_CATEGORIES, expenses, moods };
}
