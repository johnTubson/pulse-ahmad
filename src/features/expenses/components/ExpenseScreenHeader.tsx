import { router } from 'expo-router';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { ScanIcon } from 'phosphor-react-native/src/icons/Scan';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { palette } from '@/constants/theme';

type ExpenseScreenHeaderProps = {
  onBack: () => void;
  onScan?: () => void;
  scanned?: boolean;
  title?: string;
};

export function ExpenseScreenHeader({
  onBack,
  onScan,
  scanned = false,
  title,
}: ExpenseScreenHeaderProps) {
  return (
    <View
      className={`relative min-h-10 flex-row items-center justify-between ${title ? 'mb-6' : 'mb-2'}`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="z-10 h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
        onPress={onBack}
      >
        <Icon icon={CaretLeftIcon} color={palette.text} size={18} />
      </Pressable>

      {title ? (
        <Text
          className="pointer-events-none absolute inset-x-0 px-12 text-center text-xl font-bold text-text"
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : null}

      {onScan ? (
        scanned ? (
          <View className="z-10 flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2">
            <Icon icon={CheckCircleIcon} color={palette.primary} size={14} weight="fill" />
            <Text className="text-sm font-semibold text-primary">Scanned</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan receipt"
            className="z-10 flex-row items-center gap-1.5 rounded-full border border-primary px-3.5 py-2 active:opacity-70"
            onPress={onScan}
          >
            <Icon icon={ScanIcon} color={palette.primary} size={14} />
            <Text className="text-sm font-semibold text-primary">Scan</Text>
          </Pressable>
        )
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}

export function ExpenseNotFound() {
  return (
    <>
      <ExpenseScreenHeader onBack={() => router.back()} />
      <Text className="text-xl font-bold text-text">Expense not found</Text>
      <Text className="mt-2 text-sm text-text-muted">It may have already been deleted.</Text>
    </>
  );
}
