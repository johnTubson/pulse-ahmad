import {
  averageSpendByMoodBand,
  classifyStrength,
  correlationByCategory,
  moodSpendCorrelation,
  pearson,
  toDailyMoodSpendPoints,
} from '@/lib/analytics/correlation';
import type { ExpenseWithMood, MoodValue } from '@/types/finance';

function expense(
  amount: number,
  date: string,
  mood: MoodValue | null,
  categoryId: ExpenseWithMood['categoryId'] = 'other',
): ExpenseWithMood {
  return { id: `${date}-${amount}`, amount, date, mood, categoryId };
}

describe('pearson', () => {
  it('returns 1 for a perfect positive linear relationship', () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });

  it('returns -1 for a perfect negative linear relationship', () => {
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1);
  });

  it('returns null for fewer than two points', () => {
    expect(pearson([1], [2])).toBeNull();
  });

  it('returns null when a series has no variance', () => {
    expect(pearson([5, 5, 5], [1, 2, 3])).toBeNull();
  });

  it('throws when series lengths differ', () => {
    expect(() => pearson([1, 2], [1])).toThrow(/equal length/);
  });

  it('clamps results into [-1, 1]', () => {
    const r = pearson([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(r).toBeLessThanOrEqual(1);
    expect(r).toBeGreaterThanOrEqual(-1);
  });
});

describe('classifyStrength', () => {
  it('maps magnitudes to bands', () => {
    expect(classifyStrength(null)).toBe('none');
    expect(classifyStrength(0.05)).toBe('none');
    expect(classifyStrength(-0.2)).toBe('weak');
    expect(classifyStrength(0.4)).toBe('moderate');
    expect(classifyStrength(-0.8)).toBe('strong');
  });
});

describe('moodSpendCorrelation', () => {
  it('detects a negative mood/spend relationship (stress spending)', () => {
    const result = moodSpendCorrelation([
      { mood: 1, spend: 500 },
      { mood: 2, spend: 400 },
      { mood: 3, spend: 300 },
      { mood: 4, spend: 200 },
      { mood: 5, spend: 100 },
    ]);
    expect(result.direction).toBe('negative');
    expect(result.strength).toBe('strong');
    expect(result.sampleSize).toBe(5);
  });

  it('reports no direction when correlation cannot be computed', () => {
    const result = moodSpendCorrelation([{ mood: 3, spend: 100 }]);
    expect(result.coefficient).toBeNull();
    expect(result.direction).toBe('none');
  });
});

describe('toDailyMoodSpendPoints', () => {
  it('averages mood and sums spend per day, skipping untagged days', () => {
    const points = toDailyMoodSpendPoints([
      expense(100, '2026-07-01T10:00:00Z', 2),
      expense(50, '2026-07-01T20:00:00Z', 4),
      expense(80, '2026-07-02T10:00:00Z', null),
    ]);

    expect(points).toHaveLength(1);
    expect(points[0]).toEqual({ mood: 3, spend: 150 });
  });
});

describe('averageSpendByMoodBand', () => {
  it('contrasts low-mood and high-mood spend', () => {
    const summary = averageSpendByMoodBand([
      { mood: 1, spend: 400 },
      { mood: 2, spend: 500 },
      { mood: 4, spend: 100 },
      { mood: 5, spend: 200 },
      { mood: 3, spend: 999 },
    ]);
    expect(summary.lowMoodAverage).toBe(450);
    expect(summary.highMoodAverage).toBe(150);
    expect(summary.difference).toBe(300);
    expect(summary.lowMoodDays).toBe(2);
    expect(summary.highMoodDays).toBe(2);
  });

  it('returns zeros when a band has no days', () => {
    const summary = averageSpendByMoodBand([{ mood: 3, spend: 100 }]);
    expect(summary.lowMoodAverage).toBe(0);
    expect(summary.highMoodAverage).toBe(0);
    expect(summary.difference).toBe(0);
  });
});

describe('correlationByCategory', () => {
  it('computes a correlation per category, strongest first', () => {
    const result = correlationByCategory([
      expense(500, '2026-07-01T10:00:00Z', 1, 'delivery'),
      expense(400, '2026-07-02T10:00:00Z', 2, 'delivery'),
      expense(100, '2026-07-03T10:00:00Z', 5, 'delivery'),
      expense(50, '2026-07-01T10:00:00Z', 3, 'transport'),
      expense(55, '2026-07-02T10:00:00Z', 3, 'transport'),
    ]);

    expect(result[0].categoryId).toBe('delivery');
    expect(result[0].correlation.direction).toBe('negative');
  });
});
