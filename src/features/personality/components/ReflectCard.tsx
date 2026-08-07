import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type ReflectCardProps = {
  tips: string[];
  className?: string;
};

export function ReflectCard({ tips, className }: ReflectCardProps) {
  if (tips.length === 0) return null;

  return (
    <View className={cn('gap-3', className)}>
      {tips.map((tip) => (
        <View
          key={tip}
          className="rounded-2xl border border-secondary/25 bg-secondary/10 px-5 py-5"
        >
          <Text className="text-center text-sm leading-5 text-text">{tip}</Text>
        </View>
      ))}
    </View>
  );
}
