-- Pulse core schema: profiles, categories, expenses, moods, budgets, personality
-- Entity primary keys use ULID (TEXT); auth.users ids remain UUID.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Server-side ULID generator (pgulid, Apache 2.0 — https://github.com/geckoboard/pgulid)
CREATE OR REPLACE FUNCTION public.generate_ulid()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  encoding BYTEA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  timestamp BYTEA = E'\\000\\000\\000\\000\\000\\000';
  output TEXT = '';
  unix_time BIGINT;
  ulid BYTEA;
BEGIN
  unix_time = (EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000)::BIGINT;
  timestamp = SET_BYTE(timestamp, 0, (unix_time >> 40)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 1, (unix_time >> 32)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 2, (unix_time >> 24)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 3, (unix_time >> 16)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 4, (unix_time >> 8)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 5, unix_time::BIT(8)::INTEGER);
  ulid = timestamp || gen_random_bytes(10);
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 0) & 224) >> 5));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 0) & 31)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 1) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 1) & 7) << 2) | ((GET_BYTE(ulid, 2) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 2) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 2) & 1) << 4) | ((GET_BYTE(ulid, 3) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 3) & 15) << 1) | ((GET_BYTE(ulid, 4) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 4) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 4) & 3) << 3) | ((GET_BYTE(ulid, 5) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 5) & 31)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 6) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 6) & 7) << 2) | ((GET_BYTE(ulid, 7) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 7) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 7) & 1) << 4) | ((GET_BYTE(ulid, 8) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 8) & 15) << 1) | ((GET_BYTE(ulid, 9) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 9) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 9) & 3) << 3) | ((GET_BYTE(ulid, 10) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 10) & 31)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 11) & 248) >> 3));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 11) & 7) << 2) | ((GET_BYTE(ulid, 12) & 192) >> 6)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 12) & 62) >> 1));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 12) & 1) << 4) | ((GET_BYTE(ulid, 13) & 240) >> 4)));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 13) & 15) << 1) | ((GET_BYTE(ulid, 14) & 128) >> 7)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 14) & 124) >> 2));
  output = output || CHR(GET_BYTE(encoding, ((GET_BYTE(ulid, 14) & 3) << 3) | ((GET_BYTE(ulid, 15) & 224) >> 5)));
  output = output || CHR(GET_BYTE(encoding, (GET_BYTE(ulid, 15) & 31)));
  RETURN output;
END;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Categories (user-configurable; 12 defaults seeded on signup)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'other',
  colour TEXT NOT NULL DEFAULT '#94a3b8',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ---------------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  expense_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_user_id_date_idx ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON public.expenses (category_id);

-- ---------------------------------------------------------------------------
-- Moods (expense_id nullable for future daily check-ins)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.moods (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expense_id TEXT REFERENCES public.expenses (id) ON DELETE SET NULL,
  value SMALLINT NOT NULL CHECK (value BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moods_user_id_created_idx ON public.moods (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS moods_expense_id_idx ON public.moods (expense_id);

-- ---------------------------------------------------------------------------
-- Budgets (monthly; category_id NULL = overall budget)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories (id) ON DELETE CASCADE,
  amount_limit NUMERIC(12, 2) NOT NULL CHECK (amount_limit > 0),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, period)
);

-- ---------------------------------------------------------------------------
-- Personality profiles (computed by analytics engine)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.personality_profiles (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  personality_type TEXT NOT NULL,
  confidence NUMERIC(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Daily summaries (optional cache for dashboard)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id TEXT PRIMARY KEY DEFAULT public.generate_ulid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
  avg_mood NUMERIC(3, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, summary_date)
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS expenses_set_updated_at ON public.expenses;
CREATE TRIGGER expenses_set_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, colour, sort_order) VALUES
    (p_user_id, 'Food & Groceries', 'groceries', '#0d9488', 1),
    (p_user_id, 'Eating Out', 'eating-out', '#f97316', 2),
    (p_user_id, 'Delivery', 'delivery', '#ec4899', 3),
    (p_user_id, 'Transport', 'transport', '#3b82f6', 4),
    (p_user_id, 'Shopping', 'shopping', '#8b5cf6', 5),
    (p_user_id, 'Entertainment', 'entertainment', '#f59e0b', 6),
    (p_user_id, 'Bills & Utilities', 'bills', '#6366f1', 7),
    (p_user_id, 'Health', 'health', '#10b981', 8),
    (p_user_id, 'Education', 'education', '#14b8a6', 9),
    (p_user_id, 'Gifts & Donations', 'gifts', '#e879f9', 10),
    (p_user_id, 'Savings & Investment', 'savings', '#64748b', 11),
    (p_user_id, 'Other', 'other', '#94a3b8', 12)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- categories
DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
CREATE POLICY "categories_select_own" ON public.categories FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
CREATE POLICY "categories_insert_own" ON public.categories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- expenses
DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
CREATE POLICY "expenses_select_own" ON public.expenses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_insert_own" ON public.expenses;
CREATE POLICY "expenses_insert_own" ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
CREATE POLICY "expenses_update_own" ON public.expenses FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;
CREATE POLICY "expenses_delete_own" ON public.expenses FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- moods
DROP POLICY IF EXISTS "moods_select_own" ON public.moods;
CREATE POLICY "moods_select_own" ON public.moods FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "moods_insert_own" ON public.moods;
CREATE POLICY "moods_insert_own" ON public.moods FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "moods_update_own" ON public.moods;
CREATE POLICY "moods_update_own" ON public.moods FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "moods_delete_own" ON public.moods;
CREATE POLICY "moods_delete_own" ON public.moods FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- budgets
DROP POLICY IF EXISTS "budgets_select_own" ON public.budgets;
CREATE POLICY "budgets_select_own" ON public.budgets FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "budgets_insert_own" ON public.budgets;
CREATE POLICY "budgets_insert_own" ON public.budgets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "budgets_update_own" ON public.budgets;
CREATE POLICY "budgets_update_own" ON public.budgets FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "budgets_delete_own" ON public.budgets;
CREATE POLICY "budgets_delete_own" ON public.budgets FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- personality_profiles
DROP POLICY IF EXISTS "personality_select_own" ON public.personality_profiles;
CREATE POLICY "personality_select_own" ON public.personality_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "personality_insert_own" ON public.personality_profiles;
CREATE POLICY "personality_insert_own" ON public.personality_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "personality_update_own" ON public.personality_profiles;
CREATE POLICY "personality_update_own" ON public.personality_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- daily_summaries
DROP POLICY IF EXISTS "daily_summaries_select_own" ON public.daily_summaries;
CREATE POLICY "daily_summaries_select_own" ON public.daily_summaries FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "daily_summaries_insert_own" ON public.daily_summaries;
CREATE POLICY "daily_summaries_insert_own" ON public.daily_summaries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "daily_summaries_update_own" ON public.daily_summaries;
CREATE POLICY "daily_summaries_update_own" ON public.daily_summaries FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
