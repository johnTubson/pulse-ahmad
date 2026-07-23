import {
  dailyMoodSeries,
  eachDayInclusive,
  fillMoodValues,
  filterMoodsByRange,
  rangeEdgeLabel,
  sparseLabelIndices,
} from '@/features/analytics/lib/chartData';
import type { Mood } from '@/types/finance';

describe('sparseLabelIndices', () => {
  it('returns empty for length 0', () => {
    expect([...sparseLabelIndices(0)]).toEqual([]);
  });

  it('always includes first and last for longer series', () => {
    const indices = sparseLabelIndices(10, 5);
    expect(indices.has(0)).toBe(true);
    expect(indices.has(9)).toBe(true);
    expect(indices.size).toBe(5);
  });
});

describe('rangeEdgeLabel', () => {
  it('formats as short month and day', () => {
    expect(rangeEdgeLabel('2026-06-23')).toBe('Jun 23');
    expect(rangeEdgeLabel('2026-06-29')).toBe('Jun 29');
  });
});

describe('eachDayInclusive', () => {
  it('lists every calendar day in the range', () => {
    expect(eachDayInclusive('2026-07-01', '2026-07-03')).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ]);
  });
});

describe('fillMoodValues', () => {
  it('interpolates gaps and extends edges', () => {
    expect(fillMoodValues([null, 2, null, null, 5, null])).toEqual([2, 2, 3, 4, 5, 5]);
  });
});

describe('filterMoodsByRange', () => {
  const moods: Mood[] = [
    { id: '1', value: 3, createdAt: '2026-07-01T10:00:00.000Z', expenseId: null },
    { id: '2', value: 4, createdAt: '2026-07-15T10:00:00.000Z', expenseId: null },
    { id: '3', value: 2, createdAt: '2026-06-20T10:00:00.000Z', expenseId: null },
  ];

  it('keeps moods whose day key falls in range', () => {
    const result = filterMoodsByRange(moods, {
      start: '2026-07-01',
      end: '2026-07-22',
      label: 'Jul',
    });
    expect(result.map((m) => m.id)).toEqual(['1', '2']);
  });
});

describe('dailyMoodSeries', () => {
  const range = { start: '2026-07-01', end: '2026-07-22', label: 'Jul' };

  it('spans the full date range even when few days have mood data', () => {
    const moods: Mood[] = [
      {
        id: 'a',
        value: 3,
        createdAt: '2026-07-01T12:00:00.000Z',
        expenseId: null,
      },
      {
        id: 'b',
        value: 4,
        createdAt: '2026-07-06T12:00:00.000Z',
        expenseId: null,
      },
    ];

    const series = dailyMoodSeries(moods, range);
    expect(series.points).toHaveLength(22);
    const labeled = series.points.filter((p) => p.label);
    expect(labeled.length).toBe(5);
    expect(labeled[0]?.label).toBe('1');
    expect(labeled[labeled.length - 1]?.label).toBe('22');
    expect(series.rangeStartLabel).toBe('Jul 1');
    expect(series.rangeEndLabel).toBe('Jul 22');
  });
});
