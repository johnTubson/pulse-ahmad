import type { Database } from '@/types/database';
import type {
  CategoryId,
  Expense,
  MonthlyBudget,
  Mood,
  MoodValue,
  Profile,
  SpendingCategory,
} from '@/types/finance';

type Tables = Database['public']['Tables'];

type ExpenseRow = Tables['expenses']['Row'];
type MoodRow = Tables['moods']['Row'];
type CategoryRow = Tables['categories']['Row'];
type BudgetRow = Tables['budgets']['Row'];
type ProfileRow = Tables['profiles']['Row'];

export function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    categoryId: row.category_id as string as CategoryId,
    note: row.note ?? undefined,
    date: row.expense_date,
    imageUrl: row.image_url ?? undefined,
  };
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
    name: row.name,
    icon: row.icon as CategoryId,
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
