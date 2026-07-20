import type { CategoryId } from '@/types/finance';

/** Product §5 defaults — emoji stand-ins until a custom icon set lands. */
export const CATEGORY_META: Record<
  CategoryId,
  { emoji: string; label: string; shortLabel: string }
> = {
  groceries: { emoji: '🛒', label: 'Food & Groceries', shortLabel: 'Food & groceries' },
  'eating-out': { emoji: '🍽️', label: 'Eating Out', shortLabel: 'Eating out' },
  delivery: { emoji: '🛵', label: 'Delivery', shortLabel: 'Delivery' },
  transport: { emoji: '🚗', label: 'Transport', shortLabel: 'Transport' },
  shopping: { emoji: '🛍️', label: 'Shopping', shortLabel: 'Shopping' },
  entertainment: { emoji: '🎬', label: 'Entertainment', shortLabel: 'Fun' },
  bills: { emoji: '💡', label: 'Bills & Utilities', shortLabel: 'Bills & utilities' },
  health: { emoji: '💊', label: 'Health', shortLabel: 'Health' },
  education: { emoji: '📚', label: 'Education', shortLabel: 'Education' },
  gifts: { emoji: '🎁', label: 'Gifts & Donations', shortLabel: 'Gifts & social' },
  savings: { emoji: '🏦', label: 'Savings & Investment', shortLabel: 'Savings' },
  other: { emoji: '➕', label: 'Other', shortLabel: 'Other' },
};
