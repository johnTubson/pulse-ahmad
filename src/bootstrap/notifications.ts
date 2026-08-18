import * as Notifications from 'expo-notifications';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { dayKey } from '@/lib/analytics/aggregation';
import { useExpenseStore } from '@/stores/expenseStore';
import { useUiStore } from '@/stores/uiStore';

const DAILY_REMINDER_ID = 'pulse-daily-log-reminder';

let attached = false;
let appStateSub: { remove: () => void } | null = null;
let unsubUi: (() => void) | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function syncDailyReminder(enabled: boolean): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => undefined);

  if (!enabled) return;

  const granted = await ensurePermissions();
  if (!granted) {
    useUiStore.getState().setDailyReminderEnabled(false);
    useUiStore.getState().showToast('Notification permission is required for reminders');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Pulse check-in',
      body: "Log today's spend to keep your streak alive.",
      sound: undefined,
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

function maybeNudgeIfNoLogToday(): void {
  const { dailyReminderEnabled, showToast } = useUiStore.getState();
  if (!dailyReminderEnabled) return;

  const today = dayKey(new Date().toISOString());
  const loggedToday = useExpenseStore.getState().expenses.some((e) => dayKey(e.date) === today);
  if (!loggedToday) {
    showToast('No log yet today. Shake or tap + to add one.');
  }
}

function onAppStateChange(next: AppStateStatus): void {
  if (next === 'active') {
    maybeNudgeIfNoLogToday();
  }
}

/** Local daily reminder + soft in-app nudge. Attach once from bootstrap. */
export function attachNotifications(): void {
  if (attached) return;
  attached = true;

  void syncDailyReminder(useUiStore.getState().dailyReminderEnabled);

  unsubUi = useUiStore.subscribe((state, prev) => {
    if (state.dailyReminderEnabled === prev.dailyReminderEnabled) return;
    void syncDailyReminder(state.dailyReminderEnabled);
  });

  appStateSub = AppState.addEventListener('change', onAppStateChange);
}

export function detachNotifications(): void {
  unsubUi?.();
  unsubUi = null;
  appStateSub?.remove();
  appStateSub = null;
  attached = false;
}
