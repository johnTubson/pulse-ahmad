import * as Haptics from 'expo-haptics';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { AppState } from 'react-native';

import { createShakeDetector } from '@/services/sensors/detectShake';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const UPDATE_INTERVAL_MS = 100;

let attached = false;
let subscription: { remove: () => void } | null = null;
let unsubUi: (() => void) | null = null;
let unsubAuth: (() => void) | null = null;
let appStateSub: { remove: () => void } | null = null;

const detector = createShakeDetector();

function magnitude(data: AccelerometerMeasurement): number {
  return Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
}

function shouldListen(): boolean {
  if (!useUiStore.persist.hasHydrated()) return false;
  const { shakeToLogEnabled, quickLogOpen, hasCompletedOnboarding } = useUiStore.getState();
  if (!shakeToLogEnabled || quickLogOpen || !hasCompletedOnboarding) return false;
  if (useAuthStore.getState().status !== 'authenticated') return false;
  return AppState.currentState === 'active';
}

export function openQuickLogWithHaptic(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  useUiStore.getState().openQuickLog();
}

function onReading(data: AccelerometerMeasurement): void {
  const { shakeSensitivity } = useUiStore.getState();
  if (detector.push(magnitude(data), Date.now(), shakeSensitivity)) {
    openQuickLogWithHaptic();
  }
}

function startListening(): void {
  if (subscription || !shouldListen()) return;
  Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
  subscription = Accelerometer.addListener(onReading);
}

function stopListening(): void {
  subscription?.remove();
  subscription = null;
}

function syncListening(): void {
  if (shouldListen()) startListening();
  else stopListening();
}

/**
 * Shake-to-log listener. Attach once from bootstrap (not feature hooks).
 * Sensitivity is read live in onReading; listen/stop follows auth, overlay, and prefs.
 */
export function attachShakeToLog(): void {
  if (attached) return;
  attached = true;

  if (useUiStore.persist.hasHydrated()) {
    syncListening();
  } else {
    useUiStore.persist.onFinishHydration(() => {
      if (!attached) return;
      syncListening();
    });
  }

  unsubUi = useUiStore.subscribe((state, prev) => {
    if (
      state.shakeToLogEnabled === prev.shakeToLogEnabled &&
      state.quickLogOpen === prev.quickLogOpen &&
      state.hasCompletedOnboarding === prev.hasCompletedOnboarding
    ) {
      return;
    }
    syncListening();
  });

  unsubAuth = useAuthStore.subscribe((state, prev) => {
    if (state.status === prev.status) return;
    syncListening();
  });

  appStateSub = AppState.addEventListener('change', syncListening);
}

/** Test helper / teardown. */
export function detachShakeToLog(): void {
  stopListening();
  unsubUi?.();
  unsubUi = null;
  unsubAuth?.();
  unsubAuth = null;
  appStateSub?.remove();
  appStateSub = null;
  detector.reset();
  attached = false;
}
