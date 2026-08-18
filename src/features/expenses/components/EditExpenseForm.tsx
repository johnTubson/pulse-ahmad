import { router } from 'expo-router';
import { useReducer } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { AmountDisplay } from '@/features/log/components/AmountDisplay';
import { CategoryGrid } from '@/features/log/components/CategoryGrid';
import { DateTimeRow } from '@/features/log/components/DateTimeRow';
import { NoteField } from '@/features/log/components/NoteField';
import { formatAmountValue } from '@/features/log/logFormReducer';
import { formatMoney } from '@/lib/currency/formatMoney';
import { useExpenseStore } from '@/stores/expenseStore';
import { useUiStore } from '@/stores/uiStore';
import type { CategoryId, Expense } from '@/types/finance';

type EditState = {
  amount: string;
  categoryId: CategoryId;
  note: string;
  occurredAt: Date;
};

type EditAction =
  | { type: 'SET_AMOUNT'; amount: string }
  | { type: 'SET_CATEGORY'; categoryId: CategoryId }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'SET_OCCURRED_AT'; occurredAt: Date };

function createInitialState(expense: Expense): EditState {
  return {
    amount: formatAmountValue(expense.amount),
    categoryId: expense.categoryId,
    note: expense.note ?? '',
    occurredAt: new Date(expense.date),
  };
}

function editReducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount };
    case 'SET_CATEGORY':
      return { ...state, categoryId: action.categoryId };
    case 'SET_NOTE':
      return { ...state, note: action.note };
    case 'SET_OCCURRED_AT':
      return { ...state, occurredAt: action.occurredAt };
    default:
      return state;
  }
}

type EditExpenseFormProps = {
  expense: Expense;
};

export function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const update = useExpenseStore((s) => s.update);
  const remove = useExpenseStore((s) => s.remove);
  const showToast = useUiStore((s) => s.showToast);
  const [state, dispatch] = useReducer(editReducer, expense, createInitialState);

  const parsed = parseFloat(state.amount);
  const canSave = parsed > 0;

  const save = () => {
    if (!canSave) return;
    update(expense.id, {
      amount: parsed,
      categoryId: state.categoryId,
      note: state.note.trim() || undefined,
      date: state.occurredAt.toISOString(),
    });
    showToast(`Updated ${formatMoney(parsed)}`);
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete expense?', 'This removes the expense from your log.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(expense.id);
          showToast('Expense deleted');
          router.back();
        },
      },
    ]);
  };

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
        <Text className="mb-1 mt-2 text-3xl font-bold text-text">Edit expense</Text>
        <Text className="mb-6 text-sm text-text-muted">
          Change the details or delete this entry.
        </Text>

        <AmountDisplay
          value={state.amount}
          onChangeText={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          className="mb-3"
        />

        <CategoryGrid
          selectedId={state.categoryId}
          onSelect={(categoryId) => dispatch({ type: 'SET_CATEGORY', categoryId })}
          includeHidden
          className="mb-3"
        />

        <NoteField
          value={state.note}
          onChangeText={(note) => dispatch({ type: 'SET_NOTE', note })}
          className="mb-3"
        />

        <DateTimeRow
          value={state.occurredAt}
          onChange={(occurredAt) => dispatch({ type: 'SET_OCCURRED_AT', occurredAt })}
          className="mb-6"
        />

        <View className="mt-auto gap-3">
          <PrimaryButton label="Save changes" onPress={save} disabled={!canSave} />
          <SecondaryButton label="Delete expense" onPress={onDelete} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
