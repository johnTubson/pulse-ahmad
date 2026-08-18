import { createShakeDetector } from '@/services/sensors/detectShake';

const SENSITIVITY = 1.7;
const THRESHOLD = 1 + SENSITIVITY;

describe('createShakeDetector', () => {
  it('ignores a single spike', () => {
    const detector = createShakeDetector();
    expect(detector.push(THRESHOLD + 0.5, 1000, SENSITIVITY)).toBe(false);
  });

  it('fires after two peaks within the window', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    expect(detector.push(THRESHOLD + 0.5, 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1200, SENSITIVITY)).toBe(true);
  });

  it('does not fire when the second peak is outside the window', () => {
    const detector = createShakeDetector({ windowMs: 600, minPeakGapMs: 50 });
    expect(detector.push(THRESHOLD + 0.5, 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1700, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1750, SENSITIVITY)).toBe(true);
  });

  it('respects post-trigger cooldown', () => {
    const detector = createShakeDetector({ cooldownMs: 1800, minPeakGapMs: 50 });
    expect(detector.push(THRESHOLD + 0.5, 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1200, SENSITIVITY)).toBe(true);
    expect(detector.push(THRESHOLD + 0.5, 1300, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1400, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 3100, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 3300, SENSITIVITY)).toBe(true);
  });

  it('respects sensitivity threshold', () => {
    const detector = createShakeDetector({ minPeakGapMs: 50 });
    const low = 1 + 2.8;
    expect(detector.push(low + 0.1, 1000, 2.8)).toBe(false);
    expect(detector.push(low + 0.1, 1200, 2.8)).toBe(true);

    detector.reset();
    const high = 1 + 1.2;
    expect(detector.push(high - 0.05, 2000, 1.2)).toBe(false);
    expect(detector.push(high + 0.5, 2200, 1.2)).toBe(false);
    expect(detector.push(high + 0.5, 2400, 1.2)).toBe(true);
  });

  it('ignores duplicate peaks within minPeakGapMs', () => {
    const detector = createShakeDetector({ minPeakGapMs: 120 });
    expect(detector.push(THRESHOLD + 0.5, 1000, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1050, SENSITIVITY)).toBe(false);
    expect(detector.push(THRESHOLD + 0.5, 1200, SENSITIVITY)).toBe(true);
  });
});
