import type { MoodValue } from '@/types/finance';

/** Product §3.2.1 / LOG-10 labels: Low · Meh · Okay · Good · Great */
export const MOOD_META: Record<MoodValue, { emoji: string; label: string }> = {
  1: { emoji: '😔', label: 'Low' },
  2: { emoji: '😐', label: 'Meh' },
  3: { emoji: '🙂', label: 'Okay' },
  4: { emoji: '😊', label: 'Good' },
  5: { emoji: '😁', label: 'Great' },
};

export const MOOD_VALUES: MoodValue[] = [1, 2, 3, 4, 5];
