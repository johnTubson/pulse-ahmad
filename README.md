# Pulse

Mood × spending correlation app. Track expenses, tag how you feel, and discover behavioural patterns.

Built with Expo SDK 57 for CM3050 Mobile Development (Coursework 2).

## Stack

- **Expo Router** + **TypeScript** (strict)
- **NativeWind v4** — design tokens in `tokens.js` / `tailwind.config.js` (Manrope)
- **Zustand** + AsyncStorage (local prefs) with Supabase sync + offline queue
- **Supabase** — Auth, Postgres, Storage
- **OpenRouter** (default LLM OCR); Google Cloud Vision / OCR.space / Interfaze as alternate providers
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

| Variable                                 | Description                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`               | Supabase project URL                                                   |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`          | Supabase anon (public) key                                             |
| `EXPO_PUBLIC_OCR_PROVIDER`               | `llm` (default), `google`, `ocrspace`, or `interfaze`                  |
| `EXPO_PUBLIC_OPENROUTER_API_KEY`         | OpenRouter API key (default LLM OCR)                                   |
| `EXPO_PUBLIC_OPENROUTER_MODEL`           | Optional; defaults to `qwen/qwen3.7-flash`                             |
| `EXPO_PUBLIC_OPENROUTER_FALLBACK_MODELS` | Optional comma-separated vision models after primary on rate limit     |
| `EXPO_PUBLIC_OCR_API_KEY`                | Google Cloud Vision API key (when provider is google)                  |
| `EXPO_PUBLIC_EAS_PROJECT_ID`             | From `eas init` / expo.dev (optional until building)                   |
| `EXPO_PUBLIC_USE_MOCK_DATA`              | `true` = skip Supabase, seed ~60 days of demo data                     |
| `SUPABASE_SERVICE_ROLE_KEY`              | Local only: `npm run seed:supabase` (never commit / never EXPO_PUBLIC) |

### OpenRouter LLM (receipt OCR, default)

1. Create an API key at [OpenRouter](https://openrouter.ai/keys).
2. Set `EXPO_PUBLIC_OPENROUTER_API_KEY` in `.env` (and optionally `EXPO_PUBLIC_OPENROUTER_MODEL`).
3. Restart Expo with `--clear`.

The LLM uses OpenRouter JSON mode (`response_format: json_object`) and returns merchant / amount / date / note. On **rate limit / 429**, it tries cheap vision fallbacks (`qwen/qwen3.5-flash-02-23`, `google/gemma-3-4b-it`, `mistralai/mistral-small-3.2-24b-instruct`) unless you set `EXPO_PUBLIC_OPENROUTER_FALLBACK_MODELS`. Scan flow: Log → **Scan** → camera or library → OCR → amount / merchant / date pre-fill (always editable). On failure the receipt still attaches for manual entry.

### Mock data (no Supabase)

For UI / analytics work without a backend:

1. In `.env`, set `EXPO_PUBLIC_USE_MOCK_DATA=true`.
2. Restart with `npx expo start --clear`.

The app signs in as `demo@pulse.app` and hydrates expenses + moods from `src/lib/mock/seedData.ts`. Set the flag back to `false` (or remove it) to use real auth again.

Dump seed JSON to disk: `npm run seed > scripts/seed-data.json`.

### Reviewer demo account (live Supabase)

For examiners testing against a real backend (`EXPO_PUBLIC_USE_MOCK_DATA=false`):

|          |                      |
| -------- | -------------------- |
| Email    | `reviewer@pulse.app` |
| Password | `PulseReview2026!`   |

Dataset (re-seed anytime): ~60 days of patterned expenses + moods (stress/delivery correlation, weekend social spend, late-night spikes), monthly budget near ~78% used, personality unlocked (14+ days). Signing in hydrates the server profile and skips the how-it-works gate.

Prerequisites:

1. Apply migrations `001`–`006` (see [`supabase/README.md`](./supabase/README.md)).
2. Put `SUPABASE_SERVICE_ROLE_KEY` in `.env` (Dashboard → Settings → API → `service_role`).
3. Run:

```bash
npm run seed:supabase
```

Receipt OCR: scan a new receipt in-app (seed has no images).

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** auth under Authentication → Providers.
3. Run migrations in order — see [`supabase/README.md`](./supabase/README.md):
   - `supabase/migrations/001_receipts_storage_bucket.sql`
   - `supabase/migrations/002_initial_schema.sql`
   - `supabase/migrations/003_category_slug_ids.sql`
   - `supabase/migrations/004_fix_category_seed_trigger.sql`
   - `supabase/migrations/005_fix_signup_trigger.sql`
   - `supabase/migrations/006_fix_generate_ulid_search_path.sql`

### 4. Run the app

```bash
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

**Full native features** (camera, shake-to-log / sensors, notifications, secure store) need an EAS **development** build (`expo-dev-client`) or `expo run:android` / `expo run:ios`. Plain Expo Go alone does not cover every native module this app uses.

### Snack vs EAS / dev client

| Path                                | What it is for                                                                                                                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EAS `development` / `expo run:*`    | Supported way to exercise the real app, including native modules                                                                                                                         |
| Expo Go                             | Quick UI iteration; some native features are limited or unavailable                                                                                                                      |
| Expo Snack (`npm run snack:create`) | Optional filtered pack via the root `App.tsx` Snack shim; not a substitute for EAS/dev-client. Camera, sensors, notifications, and secure store will not behave like a development build |

Use Snack only for lightweight demos. Use EAS or a local native run for coursework demos that need shake, camera OCR, or notifications.

## Scripts

| Command                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `npm start`             | Start Metro dev server                                 |
| `npm run ios`           | Open iOS simulator                                     |
| `npm run android`       | Open Android emulator                                  |
| `npm run validate`      | Typecheck + lint + test (run before every PR)          |
| `npm run test:coverage` | Jest with coverage report for `src/lib/**`             |
| `npm run seed`          | Print patterned seed JSON to stdout                    |
| `npm run seed:supabase` | Create/refresh live reviewer account + data            |
| `npm run snack:create`  | Pack a filtered Expo Snack (limited; see Snack vs EAS) |
| `npm run format`        | Prettier format                                        |
| `npm run lint`          | ESLint                                                 |

## Project structure

```
pulse/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Welcome, onboarding, sign-in / sign-up
│   ├── (tabs)/             # Home, Log, Analytics, Personality (+ settings)
│   ├── scan.tsx            # Receipt camera / library OCR
│   └── expense/[id].tsx    # Edit / delete expense
├── src/
│   ├── bootstrap/          # App startup (auth sync, shake, notifications)
│   ├── components/ui/      # Shared UI
│   ├── features/           # Feature modules
│   ├── lib/                # Pure logic (test-first)
│   ├── services/           # Supabase, OCR, sensors
│   ├── stores/             # Zustand
│   └── types/              # TypeScript types + database schema
├── supabase/migrations/    # Version-controlled SQL
├── __tests__/              # Unit tests
├── tokens.js               # Design tokens (Figma export)
└── eas.json                # EAS build profiles
```

## Features

- Expense + mood logging with optional receipt scan
- Shake-to-log (motion sensor) and local daily reminder notifications
- Home budget progress when a monthly limit is set
- Analytics (period filters, category drill-down, charts)
- Personality insights from local classification
- Settings: display currency preference (no FX conversion API), category visibility (not part of onboarding), notifications, CSV export, account
- Account delete: clears local data on this device and signs out; server-side account deletion is not available from the app yet

## EAS builds

```bash
npx eas-cli login
npx eas build:configure   # links project, sets EXPO_PUBLIC_EAS_PROJECT_ID
npx eas build --profile preview
```

Profiles: `development` (dev client), `preview` (internal testing), `production` (store).

### Environment variables for APK / store builds

Local `.env` is gitignored. Expo loads it for Metro / `expo run:*`, so OCR and Supabase work in dev and the development client. Standalone APKs (`preview` / `production`) bake `app.config.js` `extra` on the EAS build machine, so those vars must exist in EAS or the built app gets empty keys (receipt scan fails with a generic error).

Add the same `EXPO_PUBLIC_*` values from `.env` for each build environment you use (`preview`, `production`, and optionally `development`):

1. **Expo dashboard:** [expo.dev](https://expo.dev) → your project → **Environment variables** → create variables for the target environment(s).
2. **Or CLI** (repeat per environment; use your real values):

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value 'https://your-project.supabase.co' --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value 'your-anon-key' --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_OCR_PROVIDER --value 'llm' --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_OPENROUTER_API_KEY --value 'your-openrouter-api-key' --environment preview --visibility plaintext
```

If you use another OCR provider, also set the matching key (`EXPO_PUBLIC_OCR_API_KEY`, `EXPO_PUBLIC_OCR_SPACE_API_KEY`, or `EXPO_PUBLIC_INTERFAZE_API_KEY`). Rebuild after changing EAS env vars; an already-installed APK will not pick them up.
