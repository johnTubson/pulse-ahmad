import type { Database } from '@/types/database';
import {
  isCategoryId,
  type Expense,
  type MonthlyBudget,
  type Mood,
  type MoodValue,
  type Profile,
  type SpendingCategory,
} from '@/types/finance';

type Tables = Database['public']['Tables'];

type ExpenseRow = Tables['expenses']['Row'];
type MoodRow = Tables['moods']['Row'];
type CategoryRow = Tables['categories']['Row'];
type BudgetRow = Tables['budgets']['Row'];
type ProfileRow = Tables['profiles']['Row'];

/** Expense row with embedded `categories.slug` from a Supabase select join. */
export type ExpenseRowWithCategory = ExpenseRow & {
  categories: { slug: string } | null;
};

function slugFromJoin(categories: ExpenseRowWithCategory['categories']): string | null {
  return categories?.slug ?? null;
}

/** Maps a DB expense to domain; `categoryId` is the category slug (not the ULID). */
export function toExpense(row: ExpenseRow, categorySlug?: string | null): Expense {
  const raw = categorySlug ?? 'other';
  return {
    id: row.id,
    amount: Number(row.amount),
    categoryId: isCategoryId(raw) ? raw : 'other',
    note: row.note ?? undefined,
    date: row.expense_date,
    imageUrl: row.image_url ?? undefined,
  };
}

export function toExpenseFromJoin(row: ExpenseRowWithCategory): Expense {
  return toExpense(row, slugFromJoin(row.categories));
}

export function toMood(row: MoodRow): Mood {
  return {
    id: row.id,
    expenseId: row.expense_id,
    value: row.value as MoodValue,
    createdAt: row.created_at,
  };
}

export function toSpendingCategory(row: CategoryRow): SpendingCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    colour: row.colour,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function toMonthlyBudget(row: BudgetRow): MonthlyBudget {
  return {
    id: row.id,
    categoryId: row.category_id,
    amountLimit: Number(row.amount_limit),
    period: row.period,
  };
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    currency: row.currency,
  };
}
