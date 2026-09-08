-- Proper category model:
--   id    TEXT PK (ULID) — opaque row identity, per-user safe
--   slug  TEXT — app CategoryId (groceries, delivery, …); UNIQUE (user_id, slug)
--   icon  TEXT — visual key (defaults match slug for built-ins)
--   name  TEXT — display label
-- expenses.category_id / budgets.category_id FK → categories.id (ULID).

ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;

ALTER TABLE public.budgets
  DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Single source of truth for the 12 built-in categories.
CREATE TABLE IF NOT EXISTS public.category_defaults (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  colour TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO public.category_defaults (slug, name, icon, colour, sort_order) VALUES
  ('groceries', 'Food & Groceries', 'groceries', '#0d9488', 1),
  ('eating-out', 'Eating Out', 'eating-out', '#f97316', 2),
  ('delivery', 'Delivery', 'delivery', '#ec4899', 3),
  ('transport', 'Transport', 'transport', '#3b82f6', 4),
  ('shopping', 'Shopping', 'shopping', '#8b5cf6', 5),
  ('entertainment', 'Entertainment', 'entertainment', '#f59e0b', 6),
  ('bills', 'Bills & Utilities', 'bills', '#6366f1', 7),
  ('health', 'Health', 'health', '#10b981', 8),
  ('education', 'Education', 'education', '#14b8a6', 9),
  ('gifts', 'Gifts & Donations', 'gifts', '#e879f9', 10),
  ('savings', 'Savings & Investment', 'savings', '#64748b', 11),
  ('other', 'Other', 'other', '#94a3b8', 12)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  colour = EXCLUDED.colour,
  sort_order = EXCLUDED.sort_order;

-- Reference data for SECURITY DEFINER seed; no end-user access needed.
ALTER TABLE public.category_defaults DISABLE ROW LEVEL SECURITY;

UPDATE public.categories c
SET slug = d.slug
FROM public.category_defaults d
WHERE c.slug IS NULL
  AND c.icon = d.icon;

UPDATE public.categories
SET slug = 'cat-' || id
WHERE slug IS NULL;

ALTER TABLE public.categories
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS categories_user_id_slug_uidx
  ON public.categories (user_id, slug);

-- Remap bare-slug primary keys → ULID; rewrite expense/budget FKs.
DO $$
BEGIN
  CREATE TEMP TABLE category_id_remap ON COMMIT DROP AS
  SELECT c.id AS old_id, public.generate_ulid() AS new_id
  FROM public.categories c
  WHERE c.id IN (SELECT slug FROM public.category_defaults);

  UPDATE public.expenses e
  SET category_id = r.new_id
  FROM category_id_remap r
  WHERE e.category_id = r.old_id;

  UPDATE public.budgets b
  SET category_id = r.new_id
  FROM category_id_remap r
  WHERE b.category_id = r.old_id;

  UPDATE public.categories c
  SET id = r.new_id
  FROM category_id_remap r
  WHERE c.id = r.old_id;
END $$;

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (id, user_id, slug, name, icon, colour, sort_order)
  SELECT public.generate_ulid(), p_user_id, d.slug, d.name, d.icon, d.colour, d.sort_order
  FROM public.category_defaults d
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.categories c
    WHERE c.user_id = p_user_id
      AND c.slug = d.slug
  );
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expenses_category_id_fkey'
  ) THEN
    ALTER TABLE public.expenses
      ADD CONSTRAINT expenses_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budgets_category_id_fkey'
  ) THEN
    ALTER TABLE public.budgets
      ADD CONSTRAINT budgets_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE;
  END IF;
END $$;
