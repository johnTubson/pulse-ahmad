import { env } from '@/constants/env';
import { useAuthStore } from '@/stores/authStore';
import { startOfflineQueueListener } from '@/stores/offlineQueue';

import { loadMockData } from './loadMockData';
import { attachSyncOnAuth } from './syncOnAuth';
import { warmAnalyticsModules } from './warmAnalytics';

let bootstrapped = false;

/**
 * One-time app startup. Attach sync *before* initialize so the first auth
 * `set` (including unconfigured Supabase → unauthenticated) is observed.
 *
 * With `EXPO_PUBLIC_USE_MOCK_DATA=true`, skip Supabase and hydrate seed data.
 */
export function bootstrapApp(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  if (env.useMockData) {
    loadMockData();
    warmAnalyticsModules();
    return;
  }

  attachSyncOnAuth();
  void useAuthStore.getState().initialize();
  startOfflineQueueListener();
  warmAnalyticsModules();
}
