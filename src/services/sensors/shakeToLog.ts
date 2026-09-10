import { router } from 'expo-router';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { AppState } from 'react-native';

import { createShakeDetector } from '@/services/sensors/detectShake';
import { DEFAULT_SHAKE_SENSITIVITY } from '@/services/sensors/shakeSensitivity';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { hapticMedium } from '@/utils/haptics';

const UPDATE_INTERVAL_MS = 100;

let attached = false;
let subscription: { remove: () => void } | null = null;
let unsubUi: (() => void) | null = null;
let unsubAuth: (() => void) | null = null;
let appStateSub: { remove: () => void } | null = null;
let accelerometerAvailable: boolean | null = null;
let availabilityPromise: Promise<boolean> | null = null;
let shakeSensitivity: number = DEFAULT_SHAKE_SENSITIVITY;

const detector = createShakeDetector();

function ensureAccelerometerAvailable(): Promise<boolean> {
  if (accelerometerAvailable !== null) return Promise.resolve(accelerometerAvailable);
  if (!availabilityPromise) {
    availabilityPromise = Accelerometer.isAvailableAsync()
      .then((available) => {
        accelerometerAvailable = available;
        return available;
      })
      .catch(() => {
        accelerometerAvailable = false;
        return false;
      })
      .finally(() => {
        availabilityPromise = null;
      });
  }
  return availabilityPromise;
}

function shouldListen(): boolean {
  if (!useUiStore.persist.hasHydrated()) return false;
  const { shakeToLogEnabled, hasCompletedOnboarding } = useUiStore.getState();
  if (!shakeToLogEnabled || !hasCompletedOnboarding) return false;
  if (useAuthStore.getState().status !== 'authenticated') return false;
  if (AppState.currentState !== 'active') return false;
  if (accelerometerAvailable === false) return false;
  return true;
}

function openLogFromShake(): void {
  hapticMedium();
  router.navigate('/log');
}

function onReading(data: AccelerometerMeasurement): void {
  const now = Date.now();
  if (detector.isCoolingDown(now)) return;

  const magnitudeSq = data.x * data.x + data.y * data.y + data.z * data.z;
  if (detector.push(magnitudeSq, now, shakeSensitivity)) {
    openLogFromShake();
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
  if (!shouldListen()) {
    stopListening();
    return;
  }
  if (accelerometerAvailable === true) {
    startListening();
    return;
  }
  if (accelerometerAvailable === false) {
    stopListening();
    return;
  }
  void ensureAccelerometerAvailable().then((available) => {
    if (!attached) return;
    if (!available || !shouldListen()) {
      stopListening();
      return;
    }
    startListening();
  });
}

/** Shake-to-log listener. Attach once from bootstrap (not feature hooks). */
export function attachShakeToLog(): void {
  if (attached) return;
  attached = true;

  shakeSensitivity = useUiStore.getState().shakeSensitivity;

  if (useUiStore.persist.hasHydrated()) {
    syncListening();
  } else {
    useUiStore.persist.onFinishHydration(() => {
      if (!attached) return;
      shakeSensitivity = useUiStore.getState().shakeSensitivity;
      syncListening();
    });
  }

  unsubUi = useUiStore.subscribe((state, prev) => {
    if (state.shakeSensitivity !== prev.shakeSensitivity) {
      shakeSensitivity = state.shakeSensitivity;
    }
    if (
      state.shakeToLogEnabled === prev.shakeToLogEnabled &&
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

/** Teardown helper (tests / hot reload). */
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
  accelerometerAvailable = null;
  availabilityPromise = null;
  shakeSensitivity = DEFAULT_SHAKE_SENSITIVITY;
}
