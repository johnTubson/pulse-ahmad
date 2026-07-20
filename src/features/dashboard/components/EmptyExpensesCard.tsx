import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type EmptyExpensesCardProps = {
  className?: string;
};

export function EmptyExpensesCard({ className }: EmptyExpensesCardProps) {
  return (
    <View className={cn('items-center rounded-xl bg-grey-100 px-6 py-12', className)}>
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-grey-200">
        <Text className="text-2xl text-text-muted">⊘</Text>
      </View>
      <Text className="text-base font-bold text-text">No expenses yet</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
        Log your expense and Pulse will start finding your patterns
      </Text>
    </View>
  );
}
