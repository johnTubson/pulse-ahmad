import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MoneyText } from '@/components/ui/MoneyText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { MOOD_META } from '@/constants/mood';
import { categoryColors, categoryLabels } from '@/constants/theme';
import { ExpenseScreenHeader } from '@/features/expenses/components/ExpenseScreenHeader';
import { formatTransactionDate } from '@/lib/date/format';
import type { Expense, MoodValue } from '@/types/finance';

type ExpenseDetailViewProps = {
  expense: Expense;
  mood: MoodValue | null;
};

type DetailRowProps = {
  label: string;
  children: ReactNode;
  showDivider?: boolean;
};

function DetailRow({ label, children, showDivider = false }: DetailRowProps) {
  return (
    <>
      <View className="px-4 py-3.5">
        <Text className="text-sm font-medium text-text-muted">{label}</Text>
        <View className="mt-1">{children}</View>
      </View>
      {showDivider ? <View className="ml-4 h-px bg-border" /> : null}
    </>
  );
}

export function ExpenseDetailView({ expense, mood }: ExpenseDetailViewProps) {
  const colour = categoryColors[expense.categoryId] ?? categoryColors.other;
  const categoryLabel = categoryLabels[expense.categoryId] ?? 'Other';
  const note = expense.note?.trim();
  const heroTitle = note || categoryLabel;

  const showNote = Boolean(note);
  const showMood = mood != null;
  const showDetails = showNote || showMood;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="grow px-4 pb-6"
      showsVerticalScrollIndicator={false}
    >
      <ExpenseScreenHeader title="Expense" onBack={() => router.back()} />

      <View className="mb-6">
        <Text className="text-lg font-semibold text-text" numberOfLines={2}>
          {heroTitle}
        </Text>

        <MoneyText amount={expense.amount} size="xl" type="expense" className="mt-2 text-text" />

        <View className="mt-4 flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${colour}22` }}
          >
            <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: colour }} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-text-muted">Category</Text>
            <Text className="text-base font-semibold text-text">{categoryLabel}</Text>
          </View>
        </View>

        <Text className="mt-4 text-sm text-text-muted">{formatTransactionDate(expense.date)}</Text>
      </View>

      {showDetails ? (
        <View className="mb-6 overflow-hidden rounded-2xl bg-grey-100">
          {showNote ? (
            <DetailRow label="Note" showDivider={showMood}>
              <Text className="text-base leading-5 text-text">{note}</Text>
            </DetailRow>
          ) : null}

          {showMood && mood != null ? (
            <DetailRow label="Mood">
              <Text className="text-base text-text">
                {MOOD_META[mood].emoji} {MOOD_META[mood].label}
              </Text>
            </DetailRow>
          ) : null}
        </View>
      ) : null}

      <View className="mt-auto">
        <PrimaryButton
          label="Edit expense"
          onPress={() => router.push(`/expense/${expense.id}/edit`)}
        />
      </View>
    </ScrollView>
  );
}
