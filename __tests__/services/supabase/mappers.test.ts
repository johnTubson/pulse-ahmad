import {
  toExpense,
  toExpenseFromJoin,
  toMonthlyBudget,
  toMood,
  toProfile,
  toSpendingCategory,
} from '@/services/supabase/mappers';

describe('supabase mappers', () => {
  it('maps an expense row using an explicit category slug', () => {
    expect(
      toExpense(
        {
          id: 'e1',
          user_id: 'u1',
          category_id: '01CATEGORYULID000000000001',
          amount: 42.5,
          note: 'lunch',
          expense_date: '2026-07-08T10:00:00Z',
          image_url: null,
          created_at: '2026-07-08T10:00:00Z',
          updated_at: '2026-07-08T10:00:00Z',
        },
        'groceries',
      ),
    ).toEqual({
      id: 'e1',
      amount: 42.5,
      categoryId: 'groceries',
      note: 'lunch',
      date: '2026-07-08T10:00:00Z',
      imageUrl: undefined,
    });
  });

  it('maps a joined expense row via categories.slug', () => {
    expect(
      toExpenseFromJoin({
        id: 'e2',
        user_id: 'u1',
        category_id: '01CATEGORYULID000000000002',
        amount: '19.99' as unknown as number,
        note: null,
        expense_date: '2026-07-08T10:00:00Z',
        image_url: 'u1/receipt.jpg',
        created_at: '2026-07-08T10:00:00Z',
        updated_at: '2026-07-08T10:00:00Z',
        categories: { slug: 'transport' },
      }),
    ).toEqual({
      id: 'e2',
      amount: 19.99,
      categoryId: 'transport',
      note: undefined,
      date: '2026-07-08T10:00:00Z',
      imageUrl: 'u1/receipt.jpg',
    });
  });

  it('maps a mood row and preserves a null expense link', () => {
    expect(
      toMood({
        id: 'm1',
        user_id: 'u1',
        expense_id: null,
        value: 4,
        created_at: '2026-07-08T10:00:00Z',
      }),
    ).toEqual({ id: 'm1', expenseId: null, value: 4, createdAt: '2026-07-08T10:00:00Z' });
  });

  it('maps category, budget, and profile rows', () => {
    expect(
      toSpendingCategory({
        id: 'c1',
        user_id: 'u1',
        slug: 'eating-out',
        name: 'Eating Out',
        icon: 'eating-out',
        colour: '#f97316',
        sort_order: 2,
        is_active: true,
        created_at: '2026-07-08T10:00:00Z',
      }),
    ).toEqual({
      id: 'c1',
      slug: 'eating-out',
      name: 'Eating Out',
      icon: 'eating-out',
      colour: '#f97316',
      sortOrder: 2,
      isActive: true,
    });

    expect(
      toMonthlyBudget({
        id: 'b1',
        user_id: 'u1',
        category_id: null,
        amount_limit: 500,
        period: 'monthly',
        created_at: '2026-07-08T10:00:00Z',
      }),
    ).toEqual({ id: 'b1', categoryId: null, amountLimit: 500, period: 'monthly' });

    expect(
      toProfile({
        id: 'u1',
        display_name: 'Ada',
        currency: 'NGN',
        created_at: '2026-07-08T10:00:00Z',
        updated_at: '2026-07-08T10:00:00Z',
      }),
    ).toEqual({ id: 'u1', displayName: 'Ada', currency: 'NGN' });
  });
});
