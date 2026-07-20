import { calculateStreak, getStreakStatus } from '@/lib/analytics/streaks';

const TODAY = new Date('2026-07-15T12:00:00Z');

describe('calculateStreak', () => {
  it('returns a zeroed result when there is no data', () => {
    expect(calculateStreak([], TODAY)).toEqual({
      current: 0,
      longest: 0,
      lastLoggedDate: null,
    });
  });

  it('counts a run ending today as the current streak', () => {
    const result = calculateStreak(
      ['2026-07-13T09:00:00Z', '2026-07-14T09:00:00Z', '2026-07-15T09:00:00Z'],
      TODAY,
    );
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.lastLoggedDate).toBe('2026-07-15');
  });

  it('counts a run ending yesterday as still current (at risk)', () => {
    const result = calculateStreak(['2026-07-13T09:00:00Z', '2026-07-14T09:00:00Z'], TODAY);
    expect(result.current).toBe(2);
  });

  it('treats multiple logs on the same day as one', () => {
    const result = calculateStreak(
      ['2026-07-15T08:00:00Z', '2026-07-15T20:00:00Z', '2026-07-14T09:00:00Z'],
      TODAY,
    );
    expect(result.current).toBe(2);
  });

  it('resets the current streak when the last log is older than yesterday', () => {
    const result = calculateStreak(['2026-07-10T09:00:00Z', '2026-07-11T09:00:00Z'], TODAY);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(2);
    expect(result.lastLoggedDate).toBe('2026-07-11');
  });

  it('tracks the longest run separately from the current run', () => {
    const result = calculateStreak(
      [
        '2026-07-01T09:00:00Z',
        '2026-07-02T09:00:00Z',
        '2026-07-03T09:00:00Z',
        '2026-07-04T09:00:00Z',
        '2026-07-14T09:00:00Z',
        '2026-07-15T09:00:00Z',
      ],
      TODAY,
    );
    expect(result.longest).toBe(4);
    expect(result.current).toBe(2);
  });

  it('defaults `today` to the real clock when omitted', () => {
    expect(() => calculateStreak(['2026-07-15T09:00:00Z'])).not.toThrow();
  });
});

describe('getStreakStatus', () => {
  it('returns "none" when nothing is logged', () => {
    expect(getStreakStatus({ current: 0, longest: 0, lastLoggedDate: null }, TODAY)).toBe('none');
  });

  it('returns "active" when logged today', () => {
    expect(getStreakStatus({ current: 3, longest: 3, lastLoggedDate: '2026-07-15' }, TODAY)).toBe(
      'active',
    );
  });

  it('returns "at-risk" when logged yesterday', () => {
    expect(getStreakStatus({ current: 2, longest: 2, lastLoggedDate: '2026-07-14' }, TODAY)).toBe(
      'at-risk',
    );
  });

  it('returns "broken" when the last log is stale', () => {
    expect(getStreakStatus({ current: 0, longest: 2, lastLoggedDate: '2026-07-11' }, TODAY)).toBe(
      'broken',
    );
  });
});
