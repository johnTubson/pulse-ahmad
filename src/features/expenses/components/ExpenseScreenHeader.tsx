import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

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
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          tintColor={palette.text}
          size={18}
        />
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
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
              tintColor={palette.primary}
              size={14}
            />
            <Text className="text-sm font-semibold text-primary">Scanned</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan receipt"
            className="z-10 flex-row items-center gap-1.5 rounded-full border border-primary px-3.5 py-2 active:opacity-70"
            onPress={onScan}
          >
            <SymbolView
              name={{ ios: 'viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
              tintColor={palette.primary}
              size={14}
            />
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
