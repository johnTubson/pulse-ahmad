import {
  classifyPersonality,
  MIN_DAYS_FOR_PERSONALITY,
  PERSONALITY_DESCRIPTIONS,
  PERSONALITY_LABELS,
  PERSONALITY_TYPES,
} from '@/lib/analytics/personality';
import type { CategoryId, ExpenseWithMood, MoodValue } from '@/types/finance';

const BASE = Date.UTC(2026, 5, 1); // 2026-06-01 is a Monday

function isoAt(dayOffset: number, hour: number): string {
  const d = new Date(BASE + dayOffset * 86_400_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(hour).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:00:00Z`;
}

function isWeekendOffset(dayOffset: number): boolean {
  const weekday = new Date(BASE + dayOffset * 86_400_000).getUTCDay();
  return weekday === 0 || weekday === 6;
}

function mk(
  dayOffset: number,
  amount: number,
  opts: { hour?: number; mood?: MoodValue | null; categoryId?: CategoryId } = {},
): ExpenseWithMood {
  return {
    id: `e-${dayOffset}-${amount}`,
    amount,
    date: isoAt(dayOffset, opts.hour ?? 12),
    mood: opts.mood ?? null,
    categoryId: opts.categoryId ?? 'transport',
  };
}

describe('classifyPersonality — gating', () => {
  it('reports insufficient data below the minimum day threshold', () => {
    const expenses = Array.from({ length: 5 }, (_, i) => mk(i, 100, { mood: 3 }));
    const result = classifyPersonality(expenses);

    expect(result.status).toBe('insufficient-data');
    if (result.status === 'insufficient-data') {
      expect(result.daysOfData).toBe(5);
      expect(result.daysRequired).toBe(MIN_DAYS_FOR_PERSONALITY);
      expect(result.progress).toBeCloseTo(5 / 14, 2);
    }
  });

  it('classifies once enough distinct days exist', () => {
    const expenses = Array.from({ length: 16 }, (_, i) => mk(i, 100, { mood: 3 }));
    const result = classifyPersonality(expenses);
    expect(result.status).toBe('classified');
  });
});

describe('classifyPersonality — pattern detection', () => {
  it('detects a stress spender (high spend on low-mood days)', () => {
    const expenses = Array.from({ length: 16 }, (_, i) =>
      i % 2 === 0 ? mk(i, 500, { mood: 1 }) : mk(i, 100, { mood: 5 }),
    );
    const result = classifyPersonality(expenses);

    expect(result.status).toBe('classified');
    if (result.status === 'classified') {
      expect(result.type).toBe('stress-spender');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.evidence.length).toBeGreaterThanOrEqual(2);
      expect(result.tips.length).toBeGreaterThan(0);
      expect(result.scores['stress-spender']).toBeGreaterThan(result.scores['reward-buyer']);
    }
  });

  it('detects a reward buyer (high spend on high-mood days)', () => {
    const expenses = Array.from({ length: 16 }, (_, i) =>
      i % 2 === 0 ? mk(i, 500, { mood: 5 }) : mk(i, 100, { mood: 1 }),
    );
    const result = classifyPersonality(expenses);
    if (result.status === 'classified') {
      expect(result.type).toBe('reward-buyer');
    }
  });

  it('detects a routine spender (steady daily spend)', () => {
    const expenses = Array.from({ length: 16 }, (_, i) =>
      mk(i, 100, { mood: ((i % 5) + 1) as MoodValue }),
    );
    const result = classifyPersonality(expenses);
    if (result.status === 'classified') {
      expect(result.type).toBe('routine-spender');
    }
  });

  it('detects an impulse owl (spending after 9pm)', () => {
    const expenses = Array.from({ length: 16 }, (_, i) =>
      mk(i, 100 + (i % 5) * 50, { hour: 22, categoryId: 'shopping' }),
    );
    const result = classifyPersonality(expenses);
    if (result.status === 'classified') {
      expect(result.type).toBe('impulse-owl');
    }
  });

  it('detects a social spender (weekend + social-category spikes)', () => {
    const expenses: ExpenseWithMood[] = [];
    for (let i = 0; i < 21; i += 1) {
      if (isWeekendOffset(i)) {
        expenses.push(mk(i, 300, { categoryId: 'eating-out' }));
      } else {
        expenses.push(mk(i, 10, { categoryId: 'transport' }));
      }
    }
    const result = classifyPersonality(expenses);
    if (result.status === 'classified') {
      expect(result.type).toBe('social-spender');
    }
  });
});

describe('personality metadata', () => {
  it('exposes a label and description for every type', () => {
    for (const type of PERSONALITY_TYPES) {
      expect(PERSONALITY_LABELS[type]).toBeTruthy();
      expect(PERSONALITY_DESCRIPTIONS[type]).toBeTruthy();
    }
  });
});
