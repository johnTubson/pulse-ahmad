import { createShakeDetector } from '@/services/sensors/detectShake';
import { DEFAULT_SHAKE_SENSITIVITY } from '@/services/sensors/shakeSensitivity';

const SENSITIVITY = DEFAULT_SHAKE_SENSITIVITY;
const THRESHOLD_SQ = (1 + SENSITIVITY) ** 2;

function above(thresholdSq: number, delta = 0.5): number {
  const mag = Math.sqrt(thresholdSq) + delta;
  return mag * mag;
}

function below(thresholdSq: number, delta = 0.05): number {
  const mag = Math.sqrt(thresholdSq) - delta;
  return mag * mag;
}

describe('createShakeDetector', () => {
  it('ignores a single spike', () => {
    const detector = createShakeDetector();
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
  });

  it('fires after two peaks within the window', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1200, SENSITIVITY)).toBe(true);
  });

  it('does not fire when the second peak is outside the window', () => {
    const detector = createShakeDetector({ windowMs: 600, minPeakGapMs: 50 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1700, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1750, SENSITIVITY)).toBe(true);
  });

  it('respects post-trigger cooldown', () => {
    const detector = createShakeDetector({ cooldownMs: 1800, minPeakGapMs: 50 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1200, SENSITIVITY)).toBe(true);
    expect(detector.isCoolingDown(1300)).toBe(true);
    expect(detector.push(above(THRESHOLD_SQ), 1300, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1400, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 3100, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 3300, SENSITIVITY)).toBe(true);
  });

  it('respects sensitivity threshold', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    const lowSens = 2.8;
    const lowSq = (1 + lowSens) ** 2;
    expect(detector.push(above(lowSq, 0.1), 1000, lowSens)).toBe(false);
    expect(detector.push(above(lowSq, 0.1), 1200, lowSens)).toBe(true);

    detector.reset();
    const highSens = 1.2;
    const highSq = (1 + highSens) ** 2;
    expect(detector.push(below(highSq), 2000, highSens)).toBe(false);
    expect(detector.push(above(highSq), 2200, highSens)).toBe(false);
    expect(detector.push(above(highSq), 2400, highSens)).toBe(true);
  });

  it('ignores duplicate peaks within minPeakGapMs', () => {
    const detector = createShakeDetector({ minPeakGapMs: 120 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1050, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1200, SENSITIVITY)).toBe(true);
  });
});
