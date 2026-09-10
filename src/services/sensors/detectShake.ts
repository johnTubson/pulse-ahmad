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

/** Resting magnitude is ~1g. Peaks above (1 + sensitivity) count toward a shake. */
export function createShakeDetector(options: ShakeDetectorOptions = {}): ShakeDetector {
  const cooldownMs = options.cooldownMs ?? 1800;
  const windowMs = options.windowMs ?? 600;
  const minPeakGapMs = options.minPeakGapMs ?? 120;
  const requiredPeaks = options.requiredPeaks ?? 2;

  let lastTriggerAt = 0;
  let lastPeakAt = 0;
  let peakTimes: number[] = [];

  return {
    isCoolingDown(now: number): boolean {
      return lastTriggerAt > 0 && now - lastTriggerAt < cooldownMs;
    },
    push(magnitudeSq: number, now: number, sensitivity: number): boolean {
      if (lastTriggerAt > 0 && now - lastTriggerAt < cooldownMs) return false;

      const threshold = 1 + sensitivity;
      if (magnitudeSq < threshold * threshold) return false;

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
      peakTimes = [];
    },
  };
}
