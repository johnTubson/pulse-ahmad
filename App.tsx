/**
 * Expo Snack entry shim. Snack requires a root App file; local dev still uses
 * `expo-router/entry` from package.json `main`.
 */
import { ExpoRoot } from 'expo-router';
import Head from 'expo-router/head';

const appContext = require.context('./app');

export default function SnackEntry() {
  return (
    <Head.Provider>
      <ExpoRoot context={appContext} />
    </Head.Provider>
  );
}
