import {
  calculateBudgetProgress,
  getBudgetAlert,
  projectPeriodSpend,
} from '@/lib/budget/calculator';

describe('calculateBudgetProgress', () => {
  it('reports "under" when comfortably below the limit', () => {
    const progress = calculateBudgetProgress(200, 500);
    expect(progress.status).toBe('under');
    expect(progress.remaining).toBe(300);
    expect(progress.ratio).toBe(0.4);
    expect(progress.percentage).toBe(40);
  });

  it('reports "warning" once the threshold is reached', () => {
    const progress = calculateBudgetProgress(400, 500);
    expect(progress.status).toBe('warning');
    expect(progress.percentage).toBe(80);
  });

  it('reports "over" when spend exceeds the limit', () => {
    const progress = calculateBudgetProgress(600, 500);
    expect(progress.status).toBe('over');
    expect(progress.remaining).toBe(-100);
  });

  it('respects a custom warning threshold', () => {
    expect(calculateBudgetProgress(300, 500, 0.5).status).toBe('warning');
  });

  it('handles a non-positive limit gracefully', () => {
    const progress = calculateBudgetProgress(120, 0);
    expect(progress.status).toBe('under');
    expect(progress.ratio).toBe(0);
    expect(progress.remaining).toBe(-120);
  });
});

describe('projectPeriodSpend', () => {
  it('projects spend from the current daily pace', () => {
    const projection = projectPeriodSpend(150, 10, 30, 400);
    expect(projection.dailyPace).toBe(15);
    expect(projection.projectedSpend).toBe(450);
    expect(projection.willExceed).toBe(true);
    expect(projection.projectedOverspend).toBe(50);
  });

  it('does not exceed when the pace stays within budget', () => {
    const projection = projectPeriodSpend(100, 10, 30, 400);
    expect(projection.projectedSpend).toBe(300);
    expect(projection.willExceed).toBe(false);
    expect(projection.projectedOverspend).toBe(0);
  });

  it('returns a zeroed projection for non-positive inputs', () => {
    expect(projectPeriodSpend(100, 0, 30, 400)).toEqual({
      dailyPace: 0,
      projectedSpend: 0,
      projectedOverspend: 0,
      willExceed: false,
    });
    expect(projectPeriodSpend(100, 5, 0, 400).projectedSpend).toBe(0);
  });

  it('ignores overspend logic when there is no limit', () => {
    const projection = projectPeriodSpend(100, 10, 30, 0);
    expect(projection.willExceed).toBe(false);
    expect(projection.projectedOverspend).toBe(0);
  });
});

describe('getBudgetAlert', () => {
  it('returns null when under budget', () => {
    expect(getBudgetAlert(calculateBudgetProgress(100, 500))).toBeNull();
  });

  it('returns a warning message with the percentage', () => {
    const message = getBudgetAlert(calculateBudgetProgress(400, 500), 'Food budget');
    expect(message).toContain('80%');
    expect(message).toContain('Food budget');
  });

  it('returns an over-budget message', () => {
    expect(getBudgetAlert(calculateBudgetProgress(600, 500))).toMatch(/past your budget/);
  });
});
