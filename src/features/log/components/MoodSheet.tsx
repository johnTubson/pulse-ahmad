import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { MOOD_META, MOOD_VALUES } from '@/constants/mood';
import type { MoodValue } from '@/types/finance';
import { cn } from '@/utils/cn';

type MoodSheetProps = {
  visible: boolean;
  onSelect: (mood: MoodValue) => void;
  onSkip: () => void;
};

const DISMISS_DELAY_MS = 500;

export function MoodSheet({ visible, onSelect, onSkip }: MoodSheetProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [pending, setPending] = useState(false);

  const resetLocal = () => {
    setSelected(null);
    setPending(false);
  };

  const handleSelect = (value: MoodValue) => {
    if (pending) return;
    setSelected(value);
    setPending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      resetLocal();
      onSelect(value);
    }, DISMISS_DELAY_MS);
  };

  const handleSkip = () => {
    if (pending) return;
    resetLocal();
    onSkip();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleSkip}
      statusBarTranslucent
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss mood sheet"
        className="flex-1 justify-end bg-black/40"
        onPress={handleSkip}
      >
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-grey-300" />

          <Text className="text-center text-2xl font-bold text-text">How are you feeling?</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
            Tagging your mood helps Pulse connect emotions to your spending over time.
          </Text>

          <View className="mb-8 mt-8 flex-row justify-between px-1">
            {MOOD_VALUES.map((value) => {
              const meta = MOOD_META[value];
              const isSelected = selected === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={meta.label}
                  accessibilityState={{ selected: isSelected, disabled: pending }}
                  className="items-center gap-2 active:opacity-70"
                  disabled={pending}
                  onPress={() => handleSelect(value)}
                >
                  <View
                    className={cn(
                      'h-14 w-14 items-center justify-center rounded-full',
                      isSelected ? 'bg-primary/15' : 'bg-grey-100',
                    )}
                  >
                    <Text className="text-2xl">{meta.emoji}</Text>
                  </View>
                  <Text
                    className={cn(
                      'text-xs font-medium',
                      isSelected ? 'text-primary' : 'text-text-muted',
                    )}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SecondaryButton label="Skip" onPress={handleSkip} disabled={pending} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
