import { createExpense, updateExpense } from '@/services/supabase/expenses';

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: mockUpdate,
    }),
  }),
}));

function chainInsert() {
  mockInsert.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ single: mockSingle });
}

function chainUpdate() {
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ eq: mockEq, select: mockSelect });
  mockSelect.mockReturnValue({ single: mockSingle });
}

describe('createExpense / updateExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts with categoryRowId and does not resolve by slug', async () => {
    chainInsert();
    mockSingle.mockResolvedValue({
      data: {
        id: 'e1',
        user_id: 'u1',
        category_id: '01ULIDGROCERIES00000000000',
        amount: 10,
        note: null,
        expense_date: '2026-07-08T10:00:00Z',
        image_url: null,
        created_at: '2026-07-08T10:00:00Z',
        updated_at: '2026-07-08T10:00:00Z',
        categories: { slug: 'groceries' },
      },
      error: null,
    });

    const expense = await createExpense('u1', {
      amount: 10,
      categoryId: 'groceries',
      categoryRowId: '01ULIDGROCERIES00000000000',
      date: '2026-07-08T10:00:00Z',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        category_id: '01ULIDGROCERIES00000000000',
        amount: 10,
      }),
    );
    expect(expense.categoryId).toBe('groceries');
  });

  it('update requires categoryRowId when categoryId changes', async () => {
    await expect(updateExpense('u1', 'e1', { categoryId: 'transport' })).rejects.toThrow(
      'categoryRowId is required',
    );
  });

  it('update writes category_id from categoryRowId', async () => {
    chainUpdate();
    mockSingle.mockResolvedValue({
      data: {
        id: 'e1',
        user_id: 'u1',
        category_id: '01ULIDTRANSPORT0000000000',
        amount: 12,
        note: null,
        expense_date: '2026-07-08T10:00:00Z',
        image_url: null,
        created_at: '2026-07-08T10:00:00Z',
        updated_at: '2026-07-08T10:00:00Z',
        categories: { slug: 'transport' },
      },
      error: null,
    });

    await updateExpense('u1', 'e1', {
      categoryId: 'transport',
      categoryRowId: '01ULIDTRANSPORT0000000000',
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ category_id: '01ULIDTRANSPORT0000000000' }),
    );
  });
});
