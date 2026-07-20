import { detectAnomalies, movingAverage, trendDirection } from '@/lib/analytics/trends';

describe('movingAverage', () => {
  it('returns null until the window is filled, then trailing means', () => {
    expect(movingAverage([2, 4, 6, 8], 2)).toEqual([null, 3, 5, 7]);
  });

  it('supports a window equal to the series length', () => {
    expect(movingAverage([1, 2, 3], 3)).toEqual([null, null, 2]);
  });

  it('throws for a non-positive or non-integer window', () => {
    expect(() => movingAverage([1, 2], 0)).toThrow(/positive integer/);
    expect(() => movingAverage([1, 2], 1.5)).toThrow(/positive integer/);
  });
});

describe('detectAnomalies', () => {
  it('flags points beyond the z-score threshold', () => {
    // A single outlier's z-score is capped at sqrt(n-1) with population std,
    // so the baseline needs enough points for a spike to clear 2 sigma.
    const anomalies = detectAnomalies([10, 11, 9, 10, 12, 8, 10, 11, 9, 100], 2);
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].index).toBe(9);
    expect(anomalies[0].direction).toBe('high');
    expect(anomalies[0].zScore).toBeGreaterThan(2);
  });

  it('detects unusually low values', () => {
    const anomalies = detectAnomalies([100, 98, 102, 99, 1], 1.5);
    expect(anomalies[0].direction).toBe('low');
  });

  it('returns nothing when there is no variance', () => {
    expect(detectAnomalies([5, 5, 5, 5])).toEqual([]);
  });

  it('returns nothing for fewer than two points', () => {
    expect(detectAnomalies([42])).toEqual([]);
  });
});

describe('trendDirection', () => {
  it('detects a rising series', () => {
    expect(trendDirection([1, 2, 3, 10, 11, 12])).toBe('rising');
  });

  it('detects a falling series', () => {
    expect(trendDirection([12, 11, 10, 3, 2, 1])).toBe('falling');
  });

  it('reports flat when the change is within the threshold', () => {
    expect(trendDirection([10, 10, 10, 10])).toBe('flat');
  });

  it('reports flat for a single point', () => {
    expect(trendDirection([5])).toBe('flat');
  });

  it('handles a zero baseline that then rises', () => {
    expect(trendDirection([0, 0, 5, 5])).toBe('rising');
  });

  it('reports flat for an all-zero baseline', () => {
    expect(trendDirection([0, 0, 0, 0])).toBe('flat');
  });
});
