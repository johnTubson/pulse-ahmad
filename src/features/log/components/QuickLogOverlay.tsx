import { SymbolView } from 'expo-symbols';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { palette } from '@/constants/theme';
import { AmountDisplay } from '@/features/log/components/AmountDisplay';
import { CategoryGrid } from '@/features/log/components/CategoryGrid';
import { MoodSheet } from '@/features/log/components/MoodSheet';
import { useQuickLog } from '@/features/log/useQuickLog';
import { useUiStore } from '@/stores/uiStore';

export function QuickLogOverlay() {
  const quickLogOpen = useUiStore((s) => s.quickLogOpen);
  if (!quickLogOpen) return null;
  return <QuickLogSheet />;
}

function QuickLogSheet() {
  const insets = useSafeAreaInsets();
  const form = useQuickLog();

  return (
    <>
      <Modal
        visible={!form.moodVisible}
        transparent
        animationType="slide"
        onRequestClose={form.dismiss}
        statusBarTranslucent
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss quick log"
          className="flex-1 justify-end bg-black/40"
          onPress={form.dismiss}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="justify-end"
          >
            <Pressable
              className="rounded-t-3xl bg-surface px-5 pt-3"
              style={{ paddingBottom: Math.max(insets.bottom, 20) }}
              onPress={(e) => e.stopPropagation()}
            >
              <View className="mb-4 h-1 w-10 self-center rounded-full bg-grey-300" />

              <View className="relative mb-4 items-center justify-center">
                <Text className="text-xl font-bold text-text">Quick log</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close quick log"
                  className="absolute right-0 h-9 w-9 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
                  onPress={form.dismiss}
                >
                  <SymbolView
                    name={{ ios: 'xmark', android: 'close', web: 'close' }}
                    tintColor={palette.text}
                    size={16}
                  />
                </Pressable>
              </View>

              <AmountDisplay value={form.amount} onChangeText={form.setAmount} className="mb-3" />

              <CategoryGrid
                selectedId={form.categoryId}
                onSelect={form.setCategoryId}
                className="mb-5"
              />

              <PrimaryButton label="Save expense" onPress={form.save} disabled={!form.canSave} />
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <MoodSheet visible={form.moodVisible} onSelect={form.finish} onSkip={form.finish} />
    </>
  );
}
