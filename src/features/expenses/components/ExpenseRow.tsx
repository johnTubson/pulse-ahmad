import { Pressable, Text, View } from 'react-native';

import { MoneyText } from '@/components/ui/MoneyText';
import { MOOD_META } from '@/constants/mood';
import { categoryColors, categoryLabels } from '@/constants/theme';
import type { Expense, MoodValue } from '@/types/finance';
import { cn } from '@/utils/cn';

type ExpenseRowProps = {
  expense: Expense;
  mood?: MoodValue | null;
  /** Hide bottom divider when this is the last row in a grouped list. */
  showDivider?: boolean;
  onPress?: () => void;
  className?: string;
};

export function ExpenseRow({
  expense,
  mood,
  showDivider = false,
  onPress,
  className,
}: ExpenseRowProps) {
  const colour = categoryColors[expense.categoryId] ?? categoryColors.other;
  const categoryLabel = categoryLabels[expense.categoryId] ?? 'Other';
  const title = expense.note?.trim() || categoryLabel;

  const body = (
    <>
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <View
          className="h-11 w-11 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${colour}22` }}
        >
          <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: colour }} />
        </View>

        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-semibold text-text" numberOfLines={1}>
            {title}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm text-text-muted" numberOfLines={1}>
              {categoryLabel}
            </Text>
            {mood != null ? (
              <>
                <View className="h-1.5 w-1.5 rounded-full bg-grey-400" />
                <Text className="text-sm">{MOOD_META[mood].emoji}</Text>
              </>
            ) : null}
          </View>
        </View>

        <MoneyText amount={expense.amount} size="md" className="text-text" />
      </View>
      {showDivider ? <View className="ml-[68px] mr-4 h-px bg-border" /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${title}`}
        className={cn('bg-transparent active:opacity-80', className)}
        onPress={onPress}
      >
        {body}
      </Pressable>
    );
  }

  return <View className={cn('bg-transparent', className)}>{body}</View>;
}
