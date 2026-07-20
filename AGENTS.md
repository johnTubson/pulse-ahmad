# Pulse — Agent Guide

Personal finance tracker at `~/Desktop/Ahmad/pulse`. Expo SDK 57 + Expo Router + TypeScript + Zustand.

## Stack

- **Expo Router** — `app/` for routes only; logic in `src/features/`
- **Zustand** + AsyncStorage — local persistence (`src/stores/`)
- **FlashList** — transaction lists
- Install native deps with `npx expo install <pkg>`

## Domain model

- `Expense` — amount, category, note, date, optional receipt image
- `Mood` — 1–5 scale, optionally linked to an expense
- `SpendingCategory` — user-configurable category with icon and colour
- `MonthlyBudget` — monthly spending limit per category (or overall)

## Conventions

- Format money with `formatMoney()` from `src/lib/currency/formatMoney.ts`
- Category labels in `src/constants/theme.ts`
- Design tokens in `tokens.js` (NativeWind); replace when Figma arrives
- Supabase client: `getSupabaseClient()` from `src/services/supabase/client.ts`
- Client IDs: `ulid()` from `src/lib/id.ts`
- Add features under `src/features/<name>/`
- New screens go in `app/` and compose feature components

## React effects

**Default: no `useEffect` / `useLayoutEffect` in `app/`, `src/features/`, `src/hooks/`, or `src/components/`.** ESLint enforces this.

Preferred alternatives:

| Need                                      | Use instead                                                          |
| ----------------------------------------- | -------------------------------------------------------------------- |
| App startup (auth, NetInfo, store wiring) | `src/bootstrap/` module — call `bootstrapApp()` at module scope      |
| React to auth / store changes             | Zustand `store.subscribe()` outside React                            |
| Auth routing                              | Declarative `<Redirect>` sibling of `Stack` (`AuthRedirect` pattern) |
| Derived UI values                         | Compute during render                                                |
| User actions                              | Event handlers                                                       |
| One-shot imperative APIs (splash hide)    | `onLayout` handler with a module-level guard (`SplashHider`)         |

`src/bootstrap/` is the only place for app-level subscriptions. Do not reintroduce sync hooks like `useSyncedData`.

## Footguns

- Do not store sensitive credentials in AsyncStorage (finance data is OK locally)
- Offline writes go through `useOfflineQueue` — do not call Supabase CRUD directly from screens
- Use FlashList for long lists, not ScrollView
