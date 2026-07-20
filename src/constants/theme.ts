import tokens from '../../tokens.js';

type ColorScale = { DEFAULT: string; dark: string } & Record<string, string>;

function semanticColor(value: string | ColorScale): string {
  return typeof value === 'string' ? value : value.DEFAULT;
}

/** Semantic palette for programmatic use (tab bar, charts, dynamic styles). */
export const palette = {
  primary: tokens.colors.primary.DEFAULT as string,
  primaryDark: tokens.colors.primary.dark as string,
  secondary: semanticColor(tokens.colors.secondary as string | ColorScale),
  income: tokens.colors.income as string,
  expense: tokens.colors.expense as string,
  success: semanticColor(tokens.colors.success as string | ColorScale),
  warning: semanticColor(tokens.colors.warning as string | ColorScale),
  error: semanticColor(tokens.colors.error as string | ColorScale),
  background: tokens.colors.background as string,
  surface: tokens.colors.surface as string,
  text: tokens.colors.text.DEFAULT as string,
  textMuted: tokens.colors.text.muted as string,
  border: tokens.colors.border as string,
} as const;

/** Mood scale 1 (low) → 5 (high), derived from Error→Success midtones. */
export const moodColors = tokens.colors.mood as Record<1 | 2 | 3 | 4 | 5, string>;

/** 12 default spending category colours for charts and chips. */
export const categoryColors = tokens.colors.category as Record<string, string>;

export const categoryLabels: Record<string, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  food: 'Food & Dining',
  transport: 'Transport',
  housing: 'Housing',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
  groceries: 'Food & Groceries',
  'eating-out': 'Eating Out',
  delivery: 'Delivery',
  bills: 'Bills & Utilities',
  education: 'Education',
  gifts: 'Gifts & Donations',
  savings: 'Savings & Investment',
};

export { tokens };
