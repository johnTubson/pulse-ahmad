import { Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import type { ProcessingStep } from '@/features/log/scannerReducer';
import { cn } from '@/utils/cn';

export type { ProcessingStep };

const STEP_COPY: Record<
  ProcessingStep,
  { title: string; subtitle: string; progress: number; header: string }
> = {
  1: {
    header: 'Processing',
    title: 'Scanning receipt',
    subtitle: 'Reading text and numbers',
    progress: 0.3,
  },
  2: {
    header: 'Processing',
    title: 'Finding total',
    subtitle: 'Identifying the total due',
    progress: 0.7,
  },
  3: {
    header: 'Processed',
    title: 'Amount detected',
    subtitle: 'Ready to log your expenses',
    progress: 1,
  },
};

type ScannerProcessingOverlayProps = {
  step: ProcessingStep;
  className?: string;
};

export function ScannerProcessingOverlay({ step, className }: ScannerProcessingOverlayProps) {
  const copy = STEP_COPY[step];

  return (
    <View className={cn('items-center px-6', className)}>
      <View className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-grey-200">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.round(copy.progress * 100)}%` }}
        />
      </View>

      <Text className="mb-1 text-center text-lg font-bold text-text">{copy.title}</Text>
      <Text className="mb-4 text-center text-sm text-text-muted">{copy.subtitle}</Text>

      <View className="flex-row items-center gap-2">
        {([1, 2, 3] as const).map((dot) => (
          <View
            key={dot}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: step >= dot ? palette.primary : palette.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function processingHeaderLabel(step: ProcessingStep): string {
  return STEP_COPY[step].header;
}
