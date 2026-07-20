import { Text } from 'react-native';

import { formatMoney } from '@/lib/currency/formatMoney';
import { cn } from '@/utils/cn';

type MoneyTextProps = {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSign?: boolean;
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
} as const;

const typeClasses = {
  income: 'text-income',
  expense: 'text-expense',
  neutral: 'text-text',
} as const;

export function MoneyText({
  amount,
  type = 'neutral',
  size = 'md',
  className,
  showSign = false,
}: MoneyTextProps) {
  const prefix = showSign && type === 'income' ? '+' : showSign && type === 'expense' ? '-' : '';

  return (
    <Text
      className={cn('font-semibold tabular-nums', sizeClasses[size], typeClasses[type], className)}
    >
      {prefix}
      {formatMoney(Math.abs(amount))}
    </Text>
  );
}
