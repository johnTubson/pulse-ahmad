/**
 * Create / refresh the coursework reviewer account on live Supabase.
 *
 * Requires (in .env, never commit service role):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:supabase
 *
 * Apply migrations 001–005 first (see supabase/README.md).
 */
import { join } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ulid } from 'ulid';

import { DEFAULT_CATEGORIES, generateSeedData } from '../src/lib/mock/seedData';
import type { CategoryId } from '../src/types/finance';
import { loadDotEnv } from './lib/loadDotEnv';

const ROOT = join(__dirname, '..');

export const REVIEWER_EMAIL = 'reviewer@pulse.app';
export const REVIEWER_PASSWORD = 'PulseReview2026!';
export const REVIEWER_DISPLAY_NAME = 'Reviewer';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env (see .env.example) then re-run npm run seed:supabase.`,
    );
  }
  return value;
}

function adminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Fail fast if migration 003+ category model is missing. */
async function assertCategorySchema(admin: SupabaseClient): Promise<void> {
  const defaults = await admin.from('category_defaults').select('slug').limit(1);
  if (defaults.error) {
    throw new Error(
      `category_defaults unavailable (${defaults.error.message}). Apply supabase/migrations/003_category_slug_ids.sql in the SQL Editor.`,
    );
  }
  if (!defaults.data?.length) {
    throw new Error(
      'category_defaults is empty. Re-run migration 003 or 004 so the 12 built-in slugs exist.',
    );
  }

  const cats = await admin.from('categories').select('id, slug').limit(1);
  if (cats.error) {
    throw new Error(
      `categories.slug unavailable (${cats.error.message}). Apply migration 003_category_slug_ids.sql.`,
    );
  }
}

async function setSignupTrigger(admin: SupabaseClient, enabled: boolean): Promise<void> {
  const { error } = await admin.rpc('pulse_set_signup_trigger', { enabled });
  if (error) {
    throw new Error(
      `pulse_set_signup_trigger RPC missing/failed (${error.message}). Apply supabase/migrations/005_fix_signup_trigger.sql in the SQL Editor, then retry.`,
    );
  }
}

async function ensureReviewerUser(admin: SupabaseClient): Promise<string> {
  const email = REVIEWER_EMAIL.toLowerCase();
  let page = 1;
  for (;;) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listed.error) throw listed.error;
    const existing = listed.data.users.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      const updated = await admin.auth.admin.updateUserById(existing.id, {
        password: REVIEWER_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: REVIEWER_DISPLAY_NAME },
      });
      if (updated.error) throw updated.error;
      return existing.id;
    }
    if (listed.data.users.length < 200) break;
    page += 1;
  }

  // Reviewer seed inserts profile + categories itself; skip the signup trigger so a
  // broken handle_new_user cannot roll back createUser (Auth HTTP 500).
  await setSignupTrigger(admin, false);
  try {
    const created = await admin.auth.admin.createUser({
      email: REVIEWER_EMAIL,
      password: REVIEWER_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: REVIEWER_DISPLAY_NAME },
    });
    if (created.error) throw created.error;
    if (!created.data.user) throw new Error('createUser returned no user');
    return created.data.user.id;
  } finally {
    await setSignupTrigger(admin, true);
  }
}

async function resetUserData(admin: SupabaseClient, userId: string): Promise<void> {
  const del = async (table: string) => {
    const { error } = await admin.from(table).delete().eq('user_id', userId);
    if (error) throw new Error(`delete ${table}: ${error.message}`);
  };

  await del('moods');
  await del('expenses');
  await del('budgets');
  await del('categories');
  await del('personality_profiles');
  await del('daily_summaries');
}

/** Insert ULID categories; returns slug → row id map. */
async function insertCategories(
  admin: SupabaseClient,
  userId: string,
): Promise<Record<CategoryId, string>> {
  const rows = DEFAULT_CATEGORIES.map((c) => ({
    id: ulid(),
    user_id: userId,
    slug: c.id,
    name: c.name,
    icon: c.icon,
    colour: c.colour,
    sort_order: c.sortOrder,
    is_active: true,
  }));

  const { error } = await admin.from('categories').insert(rows);
  if (error) throw new Error(`insert categories: ${error.message}`);

  const map = {} as Record<CategoryId, string>;
  for (const row of rows) {
    map[row.slug as CategoryId] = row.id;
  }
  return map;
}

function budgetLimitForMonth(expenses: { amount: number; date: string }[]): number {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
  const monthSpent = expenses
    .filter((e) => e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + e.amount, 0);
  const targetRatio = 0.78;
  const limit = monthSpent > 0 ? monthSpent / targetRatio : 500;
  return Math.max(50, Math.round(limit * 100) / 100);
}

async function insertSeedRows(
  admin: SupabaseClient,
  userId: string,
  categoryBySlug: Record<CategoryId, string>,
): Promise<{
  expenseCount: number;
  moodCount: number;
  budgetLimit: number;
}> {
  const data = generateSeedData({ days: 60 });

  const expenseRows = data.expenses.map((e) => {
    const categoryRowId = categoryBySlug[e.categoryId];
    if (!categoryRowId) {
      throw new Error(`No category row for slug ${e.categoryId}`);
    }
    return {
      id: e.id,
      user_id: userId,
      category_id: categoryRowId,
      amount: e.amount,
      note: e.note?.trim() ? e.note : null,
      expense_date: e.date,
      image_url: null,
    };
  });

  const chunkSize = 100;
  for (let i = 0; i < expenseRows.length; i += chunkSize) {
    const chunk = expenseRows.slice(i, i + chunkSize);
    const { error } = await admin.from('expenses').insert(chunk);
    if (error) throw new Error(`insert expenses: ${error.message}`);
  }

  const moodRows = data.moods.map((m) => ({
    id: m.id,
    user_id: userId,
    expense_id: m.expenseId,
    value: m.value,
    created_at: m.createdAt,
  }));

  for (let i = 0; i < moodRows.length; i += chunkSize) {
    const chunk = moodRows.slice(i, i + chunkSize);
    const { error } = await admin.from('moods').insert(chunk);
    if (error) throw new Error(`insert moods: ${error.message}`);
  }

  const budgetLimit = budgetLimitForMonth(data.expenses);
  const { error: budgetError } = await admin.from('budgets').insert({
    user_id: userId,
    category_id: null,
    amount_limit: budgetLimit,
    period: 'monthly',
  });
  if (budgetError) throw new Error(`insert budget: ${budgetError.message}`);

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    display_name: REVIEWER_DISPLAY_NAME,
    currency: 'USD',
  });
  if (profileError) throw new Error(`upsert profile: ${profileError.message}`);

  return {
    expenseCount: expenseRows.length,
    moodCount: moodRows.length,
    budgetLimit,
  };
}

async function main(): Promise<void> {
  loadDotEnv(ROOT);
  const url = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const admin = adminClient(url, serviceRoleKey);

  process.stderr.write('Checking category schema…\n');
  await assertCategorySchema(admin);

  process.stderr.write(`Ensuring reviewer user ${REVIEWER_EMAIL}…\n`);
  const userId = await ensureReviewerUser(admin);
  process.stderr.write(`User id: ${userId}\n`);

  process.stderr.write('Resetting reviewer expenses / moods / categories…\n');
  await resetUserData(admin, userId);

  process.stderr.write('Inserting ULID categories + patterned seed data…\n');
  const categoryBySlug = await insertCategories(admin, userId);
  const summary = await insertSeedRows(admin, userId, categoryBySlug);

  process.stderr.write(
    [
      '',
      'Seed complete.',
      `  expenses: ${summary.expenseCount}`,
      `  moods:    ${summary.moodCount}`,
      `  budget:   ${summary.budgetLimit} USD / month`,
      '',
      'Reviewer sign-in (USE_MOCK_DATA=false):',
      `  email:    ${REVIEWER_EMAIL}`,
      `  password: ${REVIEWER_PASSWORD}`,
      '',
    ].join('\n'),
  );
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`seed:supabase failed: ${message}\n`);
  process.exit(1);
});
