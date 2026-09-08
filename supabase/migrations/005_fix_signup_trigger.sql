-- Fix signup trigger (createUser HTTP 500) and allow seed script to bypass it.

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() is null during on_auth_user_created; disable RLS for this txn.
  PERFORM set_config('row_security', 'off', true);

  IF to_regclass('public.category_defaults') IS NULL THEN
    RAISE EXCEPTION 'category_defaults missing — apply migration 003_category_slug_ids.sql';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'slug'
  ) THEN
    RAISE EXCEPTION 'categories.slug missing — apply migration 003_category_slug_ids.sql';
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);

  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  BEGIN
    PERFORM public.seed_default_categories(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'pulse seed_default_categories failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.seed_default_categories(UUID) OWNER TO postgres;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Seed script can disable the trigger so createUser succeeds even if signup seed breaks.
-- Reviewer seed inserts profile + categories itself afterward.
CREATE OR REPLACE FUNCTION public.pulse_set_signup_trigger(enabled BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  IF enabled THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

ALTER FUNCTION public.pulse_set_signup_trigger(BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.pulse_set_signup_trigger(BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pulse_set_signup_trigger(BOOLEAN) TO service_role;
