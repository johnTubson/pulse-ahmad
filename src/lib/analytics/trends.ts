export type TrendDirection = 'rising' | 'falling' | 'flat';

export type Anomaly = {
  /** Index into the original series. */
  index: number;
  value: number;
  /** Standard deviations from the mean (signed). */
  zScore: number;
  direction: 'high' | 'low';
};

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Population standard deviation. */
function standardDeviation(values: number[], average: number): number {
  const variance = values.reduce((sum, v) => sum + (v - average) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Trailing simple moving average. Entries before enough history exists are
 * `null` so the output aligns index-for-index with the input series.
 */
export function movingAverage(values: number[], window: number): (number | null)[] {
  if (!Number.isInteger(window) || window <= 0) {
    throw new Error('movingAverage: window must be a positive integer');
  }

  return values.map((_, index) => {
    if (index < window - 1) {
      return null;
    }
    const slice = values.slice(index - window + 1, index + 1);
    return mean(slice);
  });
}

/**
 * Flags points that deviate more than `threshold` standard deviations from the
 * series mean (z-score outlier detection). Powers "unusual spending day"
 * insight cards. Returns nothing when there is no variance to measure against.
 */
export function detectAnomalies(values: number[], threshold = 2): Anomaly[] {
  if (values.length < 2) {
    return [];
  }

  const average = mean(values);
  const deviation = standardDeviation(values, average);
  if (deviation === 0) {
    return [];
  }

  const anomalies: Anomaly[] = [];
  values.forEach((value, index) => {
    const zScore = (value - average) / deviation;
    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        index,
        value,
        zScore,
        direction: zScore > 0 ? 'high' : 'low',
      });
    }
  });
  return anomalies;
}

/**
 * Compares the mean of the first half of a series to the second half to give a
 * coarse trend direction. `minChangeRatio` sets how large the relative shift
 * must be (default 5%) before it counts as rising/falling rather than flat.
 */
export function trendDirection(values: number[], minChangeRatio = 0.05): TrendDirection {
  if (values.length < 2) {
    return 'flat';
  }

  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(values.length - midpoint);

  const firstMean = mean(firstHalf);
  const secondMean = mean(secondHalf);
  const change = secondMean - firstMean;

  // Use the first-half mean as the baseline; fall back to an absolute check
  // when the baseline is zero to avoid dividing by zero.
  const baseline = Math.abs(firstMean);
  const ratio = baseline === 0 ? (change === 0 ? 0 : Infinity) : change / baseline;

  if (Math.abs(ratio) < minChangeRatio) {
    return 'flat';
  }
  return change > 0 ? 'rising' : 'falling';
}
