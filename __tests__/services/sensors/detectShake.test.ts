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

function twoPeaks(
  detector: ReturnType<typeof createShakeDetector>,
  t0: number,
  gapMs: number,
  sensitivity = SENSITIVITY,
  thresholdSq = THRESHOLD_SQ,
): boolean {
  expect(detector.push(below(thresholdSq), t0 - 1, sensitivity)).toBe(false);
  expect(detector.push(above(thresholdSq), t0, sensitivity)).toBe(false);
  expect(detector.push(below(thresholdSq), t0 + gapMs / 2, sensitivity)).toBe(false);
  return detector.push(above(thresholdSq), t0 + gapMs, sensitivity);
}

describe('createShakeDetector', () => {
  it('ignores a single spike', () => {
    const detector = createShakeDetector();
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
  });

  it('ignores a sustained bump (no falling edge)', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1100, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1200, SENSITIVITY)).toBe(false);
  });

  it('fires after two rising-edge peaks within the window', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    expect(twoPeaks(detector, 1000, 200)).toBe(true);
  });

  it('does not fire when the second peak is outside the window', () => {
    const detector = createShakeDetector({ windowMs: 600, minPeakGapMs: 50 });
    expect(twoPeaks(detector, 1000, 700)).toBe(false);
    // Aged-out first peak left only the second; drop then rise again to complete a pair.
    expect(detector.push(below(THRESHOLD_SQ), 1750, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1800, SENSITIVITY)).toBe(true);
  });

  it('respects post-trigger cooldown', () => {
    const detector = createShakeDetector({ cooldownMs: 1000, minPeakGapMs: 50 });
    expect(twoPeaks(detector, 1000, 200)).toBe(true);
    expect(detector.isCoolingDown(1300)).toBe(true);
    expect(twoPeaks(detector, 1400, 200)).toBe(false);
    // Triggered at 1200; cooldown ends at 2200.
    expect(twoPeaks(detector, 2250, 200)).toBe(true);
  });

  it('respects sensitivity threshold', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    const firm = 1.5;
    const firmSq = (1 + firm) ** 2;
    expect(twoPeaks(detector, 1000, 200, firm, firmSq)).toBe(true);

    detector.reset();
    const easy = 0.5;
    const easySq = (1 + easy) ** 2;
    expect(twoPeaks(detector, 2200, 200, easy, easySq)).toBe(true);
  });

  it('ignores duplicate peaks within minPeakGapMs', () => {
    const detector = createShakeDetector({ minPeakGapMs: 120 });
    expect(detector.push(above(THRESHOLD_SQ), 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(below(THRESHOLD_SQ), 1050, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1100, SENSITIVITY)).toBe(false);
    expect(detector.push(below(THRESHOLD_SQ), 1150, SENSITIVITY)).toBe(false);
    expect(detector.push(above(THRESHOLD_SQ), 1200, SENSITIVITY)).toBe(true);
  });
});
