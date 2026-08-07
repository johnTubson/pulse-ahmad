import type { PersonalityType } from '@/types/finance';

/** Figma display names (Reward Spender vs classifier “Reward Buyer”). */
export const PERSONALITY_DISPLAY_LABELS: Record<PersonalityType, string> = {
  'stress-spender': 'Stress Spender',
  'reward-buyer': 'Reward Spender',
  'routine-spender': 'Routine Spender',
  'impulse-owl': 'Impulse Owl',
  'social-spender': 'Social Spender',
};

/** Short hero one-liners (Figma; Stress typo fixed). */
export const PERSONALITY_HERO_COPY: Record<PersonalityType, string> = {
  'stress-spender': 'You tend to spend more when you’re feeling emotionally drained',
  'reward-buyer':
    'You enjoy celebrating life’s wins. Your spending often increases after good days, exciting moments, and personal achievements.',
  'routine-spender':
    'You have steady spending habits. Your financial behaviour follows consistent routines with very few unexpected changes.',
  'impulse-owl':
    'Your spending habits become more active later in the evening. Nighttime often brings your biggest purchases.',
  'social-spender':
    'Your spending reflects your social life. The moments you value most are often shared with the people around you.',
};

export const PERSONALITY_HERO_EMOJI: Record<PersonalityType, string> = {
  'stress-spender': '😔',
  'reward-buyer': '🎉',
  'routine-spender': '📊',
  'impulse-owl': '🦉',
  'social-spender': '👥',
};

/** Gradient stops [top, bottom] for hero cards. */
export const PERSONALITY_GRADIENTS: Record<PersonalityType, [string, string]> = {
  'stress-spender': ['#FFD4B8', '#FF8A4C'],
  'reward-buyer': ['#D4F5E2', '#F5E6A8'],
  'routine-spender': ['#C8F0F5', '#7EC8E8'],
  'impulse-owl': ['#E4D4F5', '#A78BDB'],
  'social-spender': ['#F8D4E4', '#E879B8'],
};

export const PATTERN_TILE_COLORS = [
  { bg: 'bg-pink-50', emoji: '😊' },
  { bg: 'bg-secondary/10', emoji: '🌙' },
  { bg: 'bg-orange-100', emoji: '📅' },
  { bg: 'bg-primary-50', emoji: '🚗' },
] as const;
