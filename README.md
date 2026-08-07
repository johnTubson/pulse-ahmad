# Pulse

Mood × spending correlation app — track expenses, tag how you feel, and discover behavioural patterns.

Built with Expo SDK 57 for CM3050 Mobile Development (Coursework 2).

## Stack

- **Expo Router** + **TypeScript** (strict)
- **NativeWind v4** — design tokens in `tokens.js` / `tailwind.config.js`
- **Zustand** + AsyncStorage (local scaffold; Supabase sync in Phase 3)
- **Supabase** — Auth, Postgres, Storage
- **Jest** + React Native Testing Library
- **EAS** — `development` / `preview` / `production` builds

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable                        | Description                                          |
| ------------------------------- | ---------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase project URL                                 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key                           |
| `EXPO_PUBLIC_OCR_API_KEY`       | Google Cloud Vision API key (restrict to Vision API) |

### Google Cloud Vision (receipt OCR)

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Cloud Vision API**.
2. Create an **API key**, restrict it to Vision API (and optionally your app’s bundle IDs).
3. Set `EXPO_PUBLIC_OCR_API_KEY` in `.env`, then restart Expo with `--clear`.

Scan flow: Log → **Scan** → camera or library → Vision `DOCUMENT_TEXT_DETECTION` → amount pre-fill (always editable). On failure the receipt still attaches for manual entry.

| `EXPO_PUBLIC_EAS_PROJECT_ID` | From `eas init` / expo.dev (optional until building) |
| `EXPO_PUBLIC_USE_MOCK_DATA` | `true` = skip Supabase, seed ~60 days of demo data |

### Mock data (no Supabase)

For UI / analytics work without a backend:

1. In `.env`, set `EXPO_PUBLIC_USE_MOCK_DATA=true`.
2. Restart with `npx expo start --clear`.

The app signs in as `demo@pulse.app` and hydrates expenses + moods from `src/lib/mock/seedData.ts` (deterministic, patterned for correlations). Set the flag back to `false` (or remove it) to use real auth again.

Dump seed JSON to disk: `npm run seed > scripts/seed-data.json`.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** auth under Authentication → Providers.
3. Run migrations in order — see [`supabase/README.md`](./supabase/README.md):
   - `supabase/migrations/001_receipts_storage_bucket.sql`
   - `supabase/migrations/002_initial_schema.sql`

### 4. Run the app

```bash
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm start`             | Start Metro dev server                        |
| `npm run ios`           | Open iOS simulator                            |
| `npm run android`       | Open Android emulator                         |
| `npm run validate`      | Typecheck + lint + test (run before every PR) |
| `npm run test:coverage` | Jest with coverage report for `src/lib/**`    |
| `npm run seed`          | Print patterned seed JSON to stdout           |
| `npm run format`        | Prettier format                               |
| `npm run lint`          | ESLint                                        |

## Project structure

```
pulse/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Onboarding + sign-in (Phase 3)
│   └── (tabs)/             # Dashboard, Transactions, Budgets, Settings
├── src/
│   ├── components/ui/      # Screen, Card, MoneyText
│   ├── features/           # Feature modules
│   ├── lib/                # Pure logic (test-first)
│   ├── services/           # Supabase, OCR, sensors
│   ├── stores/             # Zustand
│   └── types/              # TypeScript types + database schema
├── supabase/migrations/    # Version-controlled SQL
├── __tests__/lib/          # Unit tests mirroring src/lib/
├── tokens.js               # Design tokens (placeholder until Figma)
└── eas.json                # EAS build profiles
```

## EAS builds

```bash
npx eas-cli login
npx eas build:configure   # links project, sets EXPO_PUBLIC_EAS_PROJECT_ID
npx eas build --profile preview
```

Profiles: `development` (dev client), `preview` (internal testing), `production` (store).
