export type CategoryId =
  | 'groceries'
  | 'eating-out'
  | 'delivery'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'gifts'
  | 'savings'
  | 'other';

export const CATEGORY_IDS: CategoryId[] = [
  'groceries',
  'eating-out',
  'delivery',
  'transport',
  'shopping',
  'entertainment',
  'bills',
  'health',
  'education',
  'gifts',
  'savings',
  'other',
];

/** Categories tied to going out / social activity (used by personality classifier). */
export const SOCIAL_CATEGORIES: CategoryId[] = ['eating-out', 'delivery', 'entertainment'];

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type Expense = {
  id: string;
  amount: number;
  categoryId: CategoryId;
  note?: string;
  /** ISO 8601 timestamp of when the expense occurred. */
  date: string;
  imageUrl?: string;
};

export type Mood = {
  id: string;
  /** Nullable to support future standalone daily check-ins. */
  expenseId?: string | null;
  value: MoodValue;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

export type ExpenseWithMood = Expense & { mood?: MoodValue | null };

export type PersonalityType =
  'stress-spender' | 'reward-buyer' | 'routine-spender' | 'impulse-owl' | 'social-spender';

/**
 * A user-configurable spending category. `icon` is a `CategoryId`
 * slug so charts and chips can resolve colours/labels from `theme.ts`.
 */
export type SpendingCategory = {
  id: string;
  name: string;
  icon: CategoryId;
  colour: string;
  sortOrder: number;
  isActive: boolean;
};

/** A monthly spending limit. `categoryId` null means an overall budget. */
export type MonthlyBudget = {
  id: string;
  categoryId: string | null;
  amountLimit: number;
  period: 'monthly';
};

export type Profile = {
  id: string;
  displayName: string | null;
  currency: string;
};
