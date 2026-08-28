import { Text, View } from 'react-native';

import { AvatarHeader } from '@/components/ui/AvatarHeader';
import { displayHeaderName } from '@/features/dashboard/lib/greeting';
import { PersonalityLockedView } from '@/features/personality/components/PersonalityLockedView';
import { PersonalityUnlockedView } from '@/features/personality/components/PersonalityUnlockedView';
import { moodByExpenseMap, withMoods } from '@/lib/analytics/moodJoin';
import { classifyPersonality } from '@/lib/analytics/personality';
import { calculateStreak } from '@/lib/analytics/streaks';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useMoodStore } from '@/stores/moodStore';
import { useUiStore } from '@/stores/uiStore';

type PersonalityContentProps = {
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
};

export function PersonalityContent({
  onSettingsPress,
  onNotificationsPress,
}: PersonalityContentProps) {
  const email = useAuthStore((s) => s.email);
  const displayName = useUiStore((s) => s.displayName);
  const expenses = useExpenseStore((s) => s.expenses);
  const moods = useMoodStore((s) => s.moods);

  const headerName = displayHeaderName(displayName, email);
  const streak = calculateStreak(expenses.map((e) => e.date));
  const moodByExpense = moodByExpenseMap(moods);
  const tagged = withMoods(expenses, moodByExpense);
  const result = classifyPersonality(tagged);

  return (
    <View className="pb-28">
      <AvatarHeader
        name={headerName}
        streakDays={streak.current}
        action="gear"
        onActionPress={onSettingsPress}
        onNotificationsPress={onNotificationsPress}
      />

      <Text className="mb-4 mt-5 text-3xl font-bold text-text">Personality</Text>

      {result.status === 'insufficient-data' ? (
        <PersonalityLockedView
          progress={result.progress}
          daysRemaining={result.daysRequired - result.daysOfData}
        />
      ) : (
        <PersonalityUnlockedView
          type={result.type}
          daysOfData={result.daysOfData}
          confidence={result.confidence}
          evidence={result.evidence}
          tips={result.tips}
        />
      )}
    </View>
  );
}
