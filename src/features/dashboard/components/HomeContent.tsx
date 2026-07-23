import { ActivityIndicator, Text, View } from 'react-native';

import { ToastBanner } from '@/components/ui/ToastBanner';
import { EmptyExpensesCard } from '@/features/dashboard/components/EmptyExpensesCard';
import { GreetingHeader } from '@/features/dashboard/components/GreetingHeader';
import { HomeInsightCard } from '@/features/dashboard/components/HomeInsightCard';
import { InsightProgressCard } from '@/features/dashboard/components/InsightProgressCard';
import { SectionHeaderWithLink } from '@/features/dashboard/components/SectionHeaderWithLink';
import { SpentTodayCard } from '@/features/dashboard/components/SpentTodayCard';
import { StreakCard } from '@/features/dashboard/components/StreakCard';
import { firstNameFrom, greetingForHour } from '@/features/dashboard/lib/greeting';
import { getHomeInsight, getInsightProgress } from '@/features/dashboard/lib/homeInsight';
import { getTodayVsUsual } from '@/features/dashboard/lib/todaySummary';
import { ExpenseRow } from '@/features/expenses/components/ExpenseRow';
import { dayKey } from '@/lib/analytics/aggregation';
import { moodByExpenseMap, withMoods } from '@/lib/analytics/moodJoin';
import { calculateStreak, getStreakStatus } from '@/lib/analytics/streaks';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useOfflineQueue } from '@/stores/offlineQueue';

const STREAK_COPY: Record<ReturnType<typeof getStreakStatus>, string> = {
  active: 'You have shown up {n} days in a row',
  'at-risk': 'Log something today to keep your streak alive',
  broken: 'Start a new streak by logging an expense',
  none: 'Log your first expense to begin a streak',
};

const RECENT_LIMIT = 5;

type HomeContentProps = {
  onProfilePress: () => void;
  onLogMood: () => void;
  onSeeEvidence: () => void;
  onSeeAll: () => void;
};

export function HomeContent({
  onProfilePress,
  onLogMood,
  onSeeEvidence,
  onSeeAll,
}: HomeContentProps) {
  const email = useAuthStore((s) => s.email);
  const expenses = useExpenseStore((s) => s.expenses);
  const isLoading = useExpenseStore((s) => s.isLoading);
  const moods = useMoodStore((s) => s.moods);
  const pending = useOfflineQueue((s) => s.queue.length);
  const isOnline = useOfflineQueue((s) => s.isOnline);

  const moodByExpense = moodByExpenseMap(moods);
  const expensesWithMood = withMoods(expenses, moodByExpense);

  const now = new Date();
  const todayKey = dayKey(now.toISOString());
  const todayMood =
    moods.find((m) => dayKey(m.createdAt) === todayKey)?.value ??
    expensesWithMood.find((e) => dayKey(e.date) === todayKey && e.mood != null)?.mood ??
    null;

  const vsUsual = getTodayVsUsual(expenses, now);
  const streak = calculateStreak(
    expenses.map((e) => e.date),
    now,
  );
  const streakStatus = getStreakStatus(streak, now);
  const insightProgress = getInsightProgress(expenses);
  const insight = getHomeInsight(expensesWithMood);
  const recent = expenses.slice(0, RECENT_LIMIT);
  const isEmpty = expenses.length === 0;

  const name = firstNameFrom(email);
  const greeting = greetingForHour(now.getHours());

  const streakSubtitle = STREAK_COPY[streakStatus].replace('{n}', String(streak.current));

  return (
    <>
      <GreetingHeader greeting={greeting} name={name} onProfilePress={onProfilePress} />

      <ToastBanner />

      {!isOnline || pending > 0 ? (
        <View className="mb-3 self-start rounded-full bg-warning/15 px-3 py-1">
          <Text className="text-xs font-medium text-warning">
            {!isOnline ? 'Offline' : `Syncing ${pending}`}
          </Text>
        </View>
      ) : null}

      <SpentTodayCard
        className="mb-4"
        amount={vsUsual.todayTotal}
        variant={isEmpty ? 'empty' : 'populated'}
        percentDelta={isEmpty ? null : vsUsual.percentDelta}
        comparisonLabel={isEmpty ? null : vsUsual.comparisonLabel}
        mood={isEmpty ? null : todayMood}
        onLogMood={onLogMood}
      />

      {!isEmpty ? (
        <StreakCard className="mb-4" current={streak.current} subtitle={streakSubtitle} />
      ) : null}

      {insight ? (
        <HomeInsightCard className="mb-6" insight={insight} onSeeEvidence={onSeeEvidence} />
      ) : (
        <InsightProgressCard
          className="mb-6"
          loggedDays={insightProgress.loggedDays}
          required={insightProgress.required}
        />
      )}

      <SectionHeaderWithLink
        title="Recent Expenses"
        linkLabel={isEmpty ? undefined : 'See all'}
        onLinkPress={isEmpty ? undefined : onSeeAll}
      />

      {isLoading && expenses.length === 0 ? (
        <ActivityIndicator className="mt-6" />
      ) : isEmpty ? (
        <EmptyExpensesCard />
      ) : (
        <View className="overflow-hidden rounded-xl bg-grey-100">
          {recent.map((expense, index) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              mood={moodByExpense.get(expense.id) ?? null}
              showDivider={index < recent.length - 1}
            />
          ))}
        </View>
      )}

      {/* Spacer so the FAB does not cover the last row */}
      <View className="h-20" />
    </>
  );
}
