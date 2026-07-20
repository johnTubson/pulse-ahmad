import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { palette } from '@/constants/theme';

type LogHeaderProps = {
  onBack: () => void;
  onScan: () => void;
};

export function LogHeader({ onBack, onScan }: LogHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
        onPress={onBack}
      >
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          tintColor={palette.text}
          size={18}
        />
      </Pressable>

      <Text className="text-xl font-bold text-text">Log expense</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan receipt"
        className="flex-row items-center gap-1.5 rounded-full border border-primary px-3.5 py-2 active:opacity-70"
        onPress={onScan}
      >
        <SymbolView
          name={{ ios: 'viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
          tintColor={palette.primary}
          size={14}
        />
        <Text className="text-sm font-semibold text-primary">Scan</Text>
      </Pressable>
    </View>
  );
}
