export type ShakeDetectorOptions = {
  cooldownMs?: number;
  windowMs?: number;
  minPeakGapMs?: number;
  requiredPeaks?: number;
};

export type ShakeDetector = {
  /** True while post-trigger cooldown is active. */
  isCoolingDown: (now: number) => boolean;
  /** Accepts magnitude² so callers can skip `sqrt` on the cold path. */
  push: (magnitudeSq: number, now: number, sensitivity: number) => boolean;
  reset: () => void;
};

/**
 * Resting magnitude is ~1g. Peaks above (1 + sensitivity) count toward a shake.
 * Counts rising edges only (must fall below threshold between peaks) so a real
 * back-and-forth shake registers and a single sustained bump does not.
 */
export function createShakeDetector(options: ShakeDetectorOptions = {}): ShakeDetector {
  const cooldownMs = options.cooldownMs ?? 1000;
  const windowMs = options.windowMs ?? 800;
  const minPeakGapMs = options.minPeakGapMs ?? 60;
  const requiredPeaks = options.requiredPeaks ?? 2;

  let lastTriggerAt = 0;
  let lastPeakAt = 0;
  let wasAbove = false;
  let peakTimes: number[] = [];

  return {
    isCoolingDown(now: number): boolean {
      return lastTriggerAt > 0 && now - lastTriggerAt < cooldownMs;
    },
    push(magnitudeSq: number, now: number, sensitivity: number): boolean {
      const threshold = 1 + sensitivity;
      const above = magnitudeSq >= threshold * threshold;

      if (!above) {
        wasAbove = false;
        return false;
      }

      if (wasAbove) return false;
      wasAbove = true;

      if (lastTriggerAt > 0 && now - lastTriggerAt < cooldownMs) return false;
      if (lastPeakAt > 0 && now - lastPeakAt < minPeakGapMs) return false;

      lastPeakAt = now;
      peakTimes = peakTimes.filter((t) => now - t <= windowMs);
      peakTimes.push(now);

      if (peakTimes.length < requiredPeaks) return false;

      lastTriggerAt = now;
      peakTimes = [];
      lastPeakAt = 0;
      return true;
    },
    reset() {
      lastTriggerAt = 0;
      lastPeakAt = 0;
      wasAbove = false;
      peakTimes = [];
    },
  };
}
