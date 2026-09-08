-- Harden signup category seed (fixes createUser HTTP 500 when trigger fails).

-- Reference data: RLS with zero policies blocks non-owner reads and is a footgun.
ALTER TABLE IF EXISTS public.category_defaults DISABLE ROW LEVEL SECURITY;

-- Ensure unique (user_id, slug) exists as a constraint when possible.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_user_id_slug_key'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'categories_user_id_slug_uidx'
  ) THEN
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_user_id_slug_key UNIQUE USING INDEX categories_user_id_slug_uidx;
  ELSE
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_user_id_slug_key UNIQUE (user_id, slug);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN unique_violation THEN
    NULL;
END $$;

-- Ensure built-in rows exist (003 insert may have been skipped).
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

-- Avoid ON CONFLICT inference issues: insert only missing slugs.
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regclass('public.category_defaults') IS NULL THEN
    RAISE EXCEPTION 'category_defaults missing — apply migration 003_category_slug_ids.sql';
  END IF;

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
