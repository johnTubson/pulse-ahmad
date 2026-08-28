import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { dayKey } from '@/lib/analytics/aggregation';
import { filterExpensesByRange, resolvePeriodRange, sumExpenses } from '@/lib/analytics/period';
import { calculateBudgetProgress, getBudgetAlert } from '@/lib/budget/calculator';
import { useExpenseStore } from '@/stores/expenseStore';
import { useNotificationInboxStore } from '@/stores/notificationInboxStore';
import { useUiStore } from '@/stores/uiStore';
import { hapticError, hapticWarning } from '@/utils/haptics';

let attached = false;
let unsubExpenses: (() => void) | null = null;
let unsubUi: (() => void) | null = null;

async function pushLocalNotification(title: string, body: string): Promise<void> {
  const granted = await Notifications.getPermissionsAsync();
  if (!granted.granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget alerts',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: undefined,
      ...(Platform.OS === 'android' ? { channelId: 'budget-alerts' } : {}),
    },
    trigger: null,
  });
}

function evaluateBudgetAlerts(): void {
  const { monthlyBudget, budgetAlertsEnabled } = useUiStore.getState();
  if (!budgetAlertsEnabled || monthlyBudget == null || monthlyBudget <= 0) return;

  const expenses = useExpenseStore.getState().expenses;
  const range = resolvePeriodRange('month');
  const monthSpent = sumExpenses(filterExpensesByRange(expenses, range));
  const progress = calculateBudgetProgress(monthSpent, monthlyBudget);
  const message = getBudgetAlert(progress);
  if (!message || (progress.status !== 'warning' && progress.status !== 'over')) return;

  const monthKey = dayKey(new Date().toISOString()).slice(0, 7);
  const created = useNotificationInboxStore.getState().addNotification({
    type: 'budget_alert',
    title: progress.status === 'over' ? 'Budget exceeded' : 'Budget alert',
    body: message,
    createdAt: new Date().toISOString(),
    meta: { status: progress.status, monthKey },
  });

  if (!created) return;

  if (progress.status === 'over') {
    hapticError();
  } else {
    hapticWarning();
  }

  void pushLocalNotification(created.title, created.body);
}

/** Watch spend vs monthly budget and store inbox + local notifications. */
export function attachBudgetAlerts(): void {
  if (attached) return;
  attached = true;

  evaluateBudgetAlerts();

  unsubExpenses = useExpenseStore.subscribe(() => {
    evaluateBudgetAlerts();
  });

  unsubUi = useUiStore.subscribe((state, prev) => {
    if (
      state.monthlyBudget === prev.monthlyBudget &&
      state.budgetAlertsEnabled === prev.budgetAlertsEnabled
    ) {
      return;
    }
    evaluateBudgetAlerts();
  });
}

export function detachBudgetAlerts(): void {
  unsubExpenses?.();
  unsubExpenses = null;
  unsubUi?.();
  unsubUi = null;
  attached = false;
}
