import { DEFAULT_CATEGORIES, toSpendingCategories } from '@/lib/mock/seedData';
import { useCategoryStore } from '@/stores/categoryStore';

jest.mock('@/services/supabase/categories', () => ({
  listCategories: jest.fn(),
}));

describe('categoryStore', () => {
  beforeEach(() => {
    useCategoryStore.getState().reset();
  });

  it('maps slug to row id from loaded categories', () => {
    useCategoryStore.setState({
      categories: [
        {
          id: '01ULIDGROCERIES00000000000',
          slug: 'groceries',
          name: 'Food & Groceries',
          icon: 'groceries',
          colour: '#0d9488',
          sortOrder: 1,
          isActive: true,
        },
      ],
    });

    expect(useCategoryStore.getState().rowIdForSlug('groceries')).toBe(
      '01ULIDGROCERIES00000000000',
    );
    expect(useCategoryStore.getState().hasSlug('groceries')).toBe(true);
    expect(useCategoryStore.getState().rowIdForSlug('transport')).toBeUndefined();
    expect(useCategoryStore.getState().hasSlug('transport')).toBe(false);
  });

  it('seed mapping uses slug as id for mock categories', () => {
    useCategoryStore.setState({
      categories: toSpendingCategories(DEFAULT_CATEGORIES),
      isLoading: false,
      error: null,
    });
    const { categories, rowIdForSlug } = useCategoryStore.getState();

    expect(categories.length).toBe(12);
    expect(rowIdForSlug('delivery')).toBe('delivery');
  });
});
