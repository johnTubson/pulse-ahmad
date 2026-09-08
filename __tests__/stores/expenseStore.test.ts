import { useCategoryStore } from '@/stores/categoryStore';
import { useExpenseStore } from '@/stores/expenseStore';

jest.mock('@/services/supabase/categories', () => ({
  listCategories: jest.fn(),
}));

jest.mock('@/services/supabase/expenses', () => ({
  listExpenses: jest.fn(),
}));

const mockEnqueue = jest.fn();

jest.mock('@/stores/offlineQueue', () => ({
  useOfflineQueue: {
    getState: () => ({
      enqueue: mockEnqueue,
    }),
  },
}));

describe('expenseStore category row id', () => {
  beforeEach(() => {
    useExpenseStore.getState().reset();
    useCategoryStore.getState().reset();
    mockEnqueue.mockClear();
  });

  it('attaches categoryRowId from categoryStore on add', () => {
    useCategoryStore.setState({
      categories: [
        {
          id: '01ULIDGROCERIES00000000000',
          slug: 'groceries',
          name: 'Food',
          icon: 'groceries',
          colour: '#0d9488',
          sortOrder: 1,
          isActive: true,
        },
      ],
    });

    const expense = useExpenseStore.getState().add('u1', {
      amount: 5,
      categoryId: 'groceries',
    });

    expect(expense.categoryId).toBe('groceries');
    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'create',
        payload: expect.objectContaining({
          input: expect.objectContaining({
            categoryId: 'groceries',
            categoryRowId: '01ULIDGROCERIES00000000000',
          }),
        }),
      }),
    );
  });

  it('throws when category is not loaded', () => {
    expect(() =>
      useExpenseStore.getState().add('u1', {
        amount: 5,
        categoryId: 'groceries',
      }),
    ).toThrow('not loaded yet');
  });
});
