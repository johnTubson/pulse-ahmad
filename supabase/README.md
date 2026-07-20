# Supabase migrations

Apply in order via **SQL Editor** in the [Supabase Dashboard](https://supabase.com/dashboard).

| #   | File                                         | Purpose                                 |
| --- | -------------------------------------------- | --------------------------------------- |
| 1   | `migrations/001_receipts_storage_bucket.sql` | Private `receipts` storage bucket + RLS |
| 2   | `migrations/002_initial_schema.sql`          | Tables, triggers, RLS for core app data |

## After applying

1. **Storage** → confirm `receipts` bucket exists (private).
2. **Table Editor** → confirm tables: `profiles`, `categories`, `expenses`, `moods`, `budgets`, `personality_profiles`, `daily_summaries`.
3. **Authentication** → enable Email provider (sign-up / sign-in).
4. Sign up a test user → verify 12 default categories are seeded automatically.

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
    └── categories (12 defaults on signup)
    └── expenses ──► moods (optional expense_id)
    └── budgets
    └── personality_profiles
    └── daily_summaries
```

All tables use Row Level Security — users can only access their own rows.
