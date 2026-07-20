import { dayKey } from '@/lib/analytics/aggregation';
import {
  averageSpendByMoodBand,
  pearson,
  toDailyMoodSpendPoints,
} from '@/lib/analytics/correlation';
import { formatMoney } from '@/lib/currency/formatMoney';
import { SOCIAL_CATEGORIES, type ExpenseWithMood, type PersonalityType } from '@/types/finance';

export const MIN_DAYS_FOR_PERSONALITY = 14;
const CONFIDENCE_SATURATION_DAYS = 30;
const LATE_NIGHT_HOUR = 21;

export const PERSONALITY_TYPES: PersonalityType[] = [
  'stress-spender',
  'reward-buyer',
  'routine-spender',
  'impulse-owl',
  'social-spender',
];

export const PERSONALITY_LABELS: Record<PersonalityType, string> = {
  'stress-spender': 'Stress Spender',
  'reward-buyer': 'Reward Buyer',
  'routine-spender': 'Routine Spender',
  'impulse-owl': 'Impulse Owl',
  'social-spender': 'Social Spender',
};

export const PERSONALITY_DESCRIPTIONS: Record<PersonalityType, string> = {
  'stress-spender':
    'You reach for your wallet when things get tough — comfort purchases are real and measurable.',
  'reward-buyer': 'You treat good days as permission to splurge. Celebration purchases add up.',
  'routine-spender': 'Predictable and steady — your spending rarely strays far from its average.',
  'impulse-owl':
    'Late-night moments lead to late-night spending. Morning-you might not always approve.',
  'social-spender': 'Your spending is tied to going out, seeing people, and social activities.',
};

const PERSONALITY_TIPS: Record<PersonalityType, string[]> = {
  'stress-spender': [
    'On a rough day, a short pause before ordering can be revealing.',
    'Notice which categories climb when your mood dips.',
  ],
  'reward-buyer': [
    'Celebrating is great — planning the treat in advance can make it feel even better.',
    'Watch how your good-day spending compares to your budget.',
  ],
  'routine-spender': [
    'Your steadiness makes budgeting predictable — an easy strength to build on.',
    'Small recurring costs are worth an occasional review.',
  ],
  'impulse-owl': [
    'A quick look at late-night purchases in the morning can be eye-opening.',
    'Consider saving items to a wishlist after 9pm rather than buying right away.',
  ],
  'social-spender': [
    'Setting a loose weekend allowance keeps social spending guilt-free.',
    'Notice which outings feel most worth it to you.',
  ],
};

export type PersonalityScores = Record<PersonalityType, number>;

export type PersonalityResult =
  | {
      status: 'insufficient-data';
      daysOfData: number;
      daysRequired: number;
      /** Progress toward unlocking, 0–1. */
      progress: number;
    }
  | {
      status: 'classified';
      type: PersonalityType;
      /** 0–1 confidence based on data volume and how decisively one type wins. */
      confidence: number;
      scores: PersonalityScores;
      daysOfData: number;
      evidence: string[];
      tips: string[];
    };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Wall-clock hour from an ISO timestamp, or -1 when unavailable. */
function hourOf(iso: string): number {
  const hour = Number(iso.slice(11, 13));
  return Number.isNaN(hour) ? -1 : hour;
}

function isWeekend(iso: string): boolean {
  const [year, month, day] = dayKey(iso).split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
}

type Features = {
  daysOfData: number;
  correlation: number;
  band: ReturnType<typeof averageSpendByMoodBand>;
  dailyMean: number;
  coefficientOfVariation: number;
  lateNightRatio: number;
  weekendRatio: number;
  socialCategoryRatio: number;
};

function extractFeatures(expenses: ExpenseWithMood[]): Features {
  const dailySpend = new Map<string, number>();
  let totalAmount = 0;
  let lateNightAmount = 0;
  let weekendAmount = 0;
  let socialCategoryAmount = 0;

  for (const expense of expenses) {
    const key = dayKey(expense.date);
    dailySpend.set(key, (dailySpend.get(key) ?? 0) + expense.amount);
    totalAmount += expense.amount;
    if (hourOf(expense.date) >= LATE_NIGHT_HOUR) {
      lateNightAmount += expense.amount;
    }
    if (isWeekend(expense.date)) {
      weekendAmount += expense.amount;
    }
    if (SOCIAL_CATEGORIES.includes(expense.categoryId)) {
      socialCategoryAmount += expense.amount;
    }
  }

  const dailyValues = Array.from(dailySpend.values());
  const dailyMean = mean(dailyValues);
  const dailyStd = Math.sqrt(mean(dailyValues.map((v) => (v - dailyMean) ** 2)));
  const coefficientOfVariation = dailyMean === 0 ? 0 : dailyStd / dailyMean;

  const points = toDailyMoodSpendPoints(expenses);
  const correlation =
    pearson(
      points.map((p) => p.mood),
      points.map((p) => p.spend),
    ) ?? 0;

  return {
    daysOfData: dailySpend.size,
    correlation,
    band: averageSpendByMoodBand(points),
    dailyMean,
    coefficientOfVariation,
    lateNightRatio: totalAmount === 0 ? 0 : lateNightAmount / totalAmount,
    weekendRatio: totalAmount === 0 ? 0 : weekendAmount / totalAmount,
    socialCategoryRatio: totalAmount === 0 ? 0 : socialCategoryAmount / totalAmount,
  };
}

/** Share of the mood-band total attributable to one side (0.5 = balanced). */
function bandShare(part: number, other: number): number {
  const sum = part + other;
  return sum === 0 ? 0 : part / sum;
}

function scoreTypes(features: Features): PersonalityScores {
  const { band } = features;

  const stressBand = clamp01((bandShare(band.lowMoodAverage, band.highMoodAverage) - 0.5) * 2);
  const rewardBand = clamp01((bandShare(band.highMoodAverage, band.lowMoodAverage) - 0.5) * 2);

  return {
    'stress-spender': round2(0.5 * stressBand + 0.5 * clamp01(-features.correlation)),
    'reward-buyer': round2(0.5 * rewardBand + 0.5 * clamp01(features.correlation)),
    'routine-spender': round2(clamp01(1 - features.coefficientOfVariation)),
    // A flat distribution would put ~12.5% after 9pm; 50% is emphatically owl.
    'impulse-owl': round2(clamp01(features.lateNightRatio * 2)),
    'social-spender': round2(
      clamp01(0.6 * (features.weekendRatio / 0.5) + 0.6 * (features.socialCategoryRatio / 0.6)),
    ),
  };
}

function buildEvidence(type: PersonalityType, features: Features): string[] {
  const evidence: string[] = [`Based on ${features.daysOfData} days of logging.`];
  const { band } = features;

  switch (type) {
    case 'stress-spender':
      evidence.push(
        `You spent an average of ${formatMoney(band.lowMoodAverage)} on low-mood days, compared to ${formatMoney(band.highMoodAverage)} on high-mood days.`,
      );
      break;
    case 'reward-buyer':
      evidence.push(
        `You spent an average of ${formatMoney(band.highMoodAverage)} on high-mood days, compared to ${formatMoney(band.lowMoodAverage)} on low-mood days.`,
      );
      break;
    case 'routine-spender':
      evidence.push(
        `Your daily spending stays close to ${formatMoney(features.dailyMean)}, rarely swinging far.`,
      );
      break;
    case 'impulse-owl':
      evidence.push(
        `${Math.round(features.lateNightRatio * 100)}% of your spending happens after 9pm.`,
      );
      break;
    case 'social-spender':
      evidence.push(
        `${Math.round(features.weekendRatio * 100)}% of your spending lands on weekends.`,
      );
      break;
  }

  return evidence;
}

function computeConfidence(scores: PersonalityScores, daysOfData: number): number {
  const sorted = Object.values(scores).sort((a, b) => b - a);
  const margin = sorted[0] - (sorted[1] ?? 0);
  const dataConfidence = clamp01(daysOfData / CONFIDENCE_SATURATION_DAYS);
  const marginConfidence = clamp01(margin / 0.3);
  return round2(0.6 * dataConfidence + 0.4 * marginConfidence);
}

function pickWinner(scores: PersonalityScores): PersonalityType {
  let winner: PersonalityType = PERSONALITY_TYPES[0];
  for (const type of PERSONALITY_TYPES) {
    if (scores[type] > scores[winner]) {
      winner = type;
    }
  }
  return winner;
}

/**
 * Classifies spending personality from expense + mood history. Returns an
 * `insufficient-data` result (with unlock progress) until `MIN_DAYS_FOR_PERSONALITY`
 * distinct days exist, then the strongest-matching type with supporting evidence.
 */
export function classifyPersonality(expenses: ExpenseWithMood[]): PersonalityResult {
  const features = extractFeatures(expenses);

  if (features.daysOfData < MIN_DAYS_FOR_PERSONALITY) {
    return {
      status: 'insufficient-data',
      daysOfData: features.daysOfData,
      daysRequired: MIN_DAYS_FOR_PERSONALITY,
      progress: round2(clamp01(features.daysOfData / MIN_DAYS_FOR_PERSONALITY)),
    };
  }

  const scores = scoreTypes(features);
  const type = pickWinner(scores);

  return {
    status: 'classified',
    type,
    confidence: computeConfidence(scores, features.daysOfData),
    scores,
    daysOfData: features.daysOfData,
    evidence: buildEvidence(type, features),
    tips: PERSONALITY_TIPS[type],
  };
}
