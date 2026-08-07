import { Children, Fragment, PropsWithChildren, isValidElement } from 'react';
import { View } from 'react-native';

import { cn } from '@/utils/cn';

type SettingsGroupProps = PropsWithChildren<{
  className?: string;
}>;

export function SettingsGroup({ children, className }: SettingsGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View className={cn('overflow-hidden rounded-2xl border border-border bg-surface', className)}>
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {child}
          {index < items.length - 1 ? <View className="ml-16 h-px bg-border" /> : null}
        </Fragment>
      ))}
    </View>
  );
}
