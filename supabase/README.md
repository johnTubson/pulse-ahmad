# Supabase migrations

Apply in order via **SQL Editor** in the [Supabase Dashboard](https://supabase.com/dashboard).

| #   | File                                               | Purpose                                                        |
| --- | -------------------------------------------------- | -------------------------------------------------------------- |
| 1   | `migrations/001_receipts_storage_bucket.sql`       | Private `receipts` storage bucket + RLS                        |
| 2   | `migrations/002_initial_schema.sql`                | Tables, triggers, RLS for core app data                        |
| 3   | `migrations/003_category_slug_ids.sql`             | Category `slug` column; ULID `id`; restore expense/budget FKs  |
| 4   | `migrations/004_fix_category_seed_trigger.sql`     | Harden signup `seed_default_categories` (fixes createUser 500) |
| 5   | `migrations/005_fix_signup_trigger.sql`            | RLS-safe signup trigger + seed bypass RPC                      |
| 6   | `migrations/006_fix_generate_ulid_search_path.sql` | Fix ULID `gen_random_bytes` under signup `search_path`         |

## Category columns

| Column | Role                                                           |
| ------ | -------------------------------------------------------------- |
| `id`   | Opaque ULID primary key (per row, multi-user safe)             |
| `slug` | App `CategoryId` (`groceries`, `delivery`, …); unique per user |
| `icon` | Visual key (built-ins default to the same value as `slug`)     |
| `name` | Display label                                                  |

`expenses.category_id` and `budgets.category_id` reference `categories.id` (ULID). Categories load into `categoryStore` (id + slug); expense writes pass `categoryRowId` from that loaded state. Reads join `categories.slug` so analytics/UI keep using semantic ids.

Built-in definitions live in `public.category_defaults` (migration 003); signup copies them into per-user `categories` rows.

## After applying

1. **Storage** → confirm `receipts` bucket exists (private).
2. **Table Editor** → confirm tables: `profiles`, `categories`, `expenses`, `moods`, `budgets`, `personality_profiles`, `daily_summaries`.
3. **Authentication** → enable Email provider (sign-up / sign-in).
4. Sign up a test user → verify 12 default categories (ULID `id` + `slug`).
5. Optional: seed the examiner account with `npm run seed:supabase` (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env`). See README **Reviewer demo account**.

## Reviewer seed

```bash
# .env must include EXPO_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run seed:supabase
```

Creates/refreshes `reviewer@pulse.app` with ~60 days of patterned expenses, moods, profile, and a monthly budget. Idempotent: safe to re-run.

## Receipts bucket

| Setting       | Value                  |
| ------------- | ---------------------- |
| Name          | `receipts`             |
| Public        | No                     |
| Max file size | 5 MB                   |
| Path layout   | `{user_id}/{filename}` |

## Schema overview

```
auth.users
    └── profiles
    └── categories (id ULID, slug, icon, name; defaults from category_defaults)
    └── expenses (category_id → categories.id) ──► moods
    └── budgets (category_id → categories.id, nullable)
    └── personality_profiles
    └── daily_summaries
```

All tables use Row Level Security — users can only access their own rows.
