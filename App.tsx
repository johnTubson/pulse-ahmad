/**
 * Expo Snack entry shim. Snack requires a root App file; local dev still uses
 * `expo-router/entry` from package.json `main`.
 */
import { ExpoRoot, type RequireContext } from 'expo-router';
import Head from 'expo-router/head';

const appContext = (require as { context(path: string): RequireContext }).context('./app');

export default function SnackEntry() {
  return (
    <Head.Provider>
      <ExpoRoot context={appContext} />
    </Head.Provider>
  );
}
