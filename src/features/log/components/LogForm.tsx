import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ExpenseScreenHeader } from '@/features/expenses/components/ExpenseScreenHeader';
import { AmountDisplay } from '@/features/log/components/AmountDisplay';
import { CategoryGrid } from '@/features/log/components/CategoryGrid';
import { DateTimeRow } from '@/features/log/components/DateTimeRow';
import { MoodSheet } from '@/features/log/components/MoodSheet';
import { NoteField } from '@/features/log/components/NoteField';
import { ReceiptAttachedRow } from '@/features/log/components/ReceiptAttachedRow';
import { ScanSourceSheet } from '@/features/log/components/ScanSourceSheet';
import { useLogForm } from '@/features/log/useLogForm';

export function LogForm() {
  const form = useLogForm();

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ExpenseScreenHeader
          title="Log expense"
          scanned={form.scanned}
          onBack={form.goHome}
          onScan={form.openScanSheet}
        />

        <AmountDisplay value={form.amount} onChangeText={form.setAmount} className="mb-3" />

        {form.ocrStatus === 'failed' ? (
          <Text className="mb-3 text-center text-sm text-error">
            We couldn&apos;t detect the total. You can enter it manually.
          </Text>
        ) : null}

        {form.receiptUri ? (
          <ReceiptAttachedRow onRemove={form.clearReceipt} className="mb-3" />
        ) : null}

        <CategoryGrid selectedId={form.categoryId} onSelect={form.setCategoryId} className="mb-3" />

        <NoteField value={form.note} onChangeText={form.setNote} className="mb-3" />

        <DateTimeRow value={form.occurredAt} onChange={form.setOccurredAt} className="mb-6" />

        <View className="mt-auto">
          <PrimaryButton
            label={form.saving ? 'Saving…' : 'Save expense'}
            onPress={form.save}
            disabled={!form.canSave}
          />
        </View>
      </ScrollView>

      <MoodSheet visible={form.moodVisible} onSelect={form.finish} onSkip={() => form.finish()} />

      <ScanSourceSheet
        visible={form.scanVisible}
        onClose={form.closeScanSheet}
        onScanReceipt={form.openCameraScanner}
        onTakePhoto={form.openCameraScanner}
        onChooseLibrary={form.openLibraryScanner}
      />
    </KeyboardAvoidingView>
  );
}
