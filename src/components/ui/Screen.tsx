import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

type ScreenProps = PropsWithChildren<{
  className?: string;
  scroll?: boolean;
}>;

export function Screen({ children, className, scroll = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = <View className={cn('flex-1 px-5', className)}>{children}</View>;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {scroll ? (
        <ScrollView contentContainerClassName="grow pb-6" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}
