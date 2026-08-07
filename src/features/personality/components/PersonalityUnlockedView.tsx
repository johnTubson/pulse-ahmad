import { Text, View } from 'react-native';

import { ConfidenceBar } from '@/features/personality/components/ConfidenceBar';
import { PatternList } from '@/features/personality/components/PatternList';
import { PersonalityHeroCard } from '@/features/personality/components/PersonalityHeroCard';
import { ReflectCard } from '@/features/personality/components/ReflectCard';
import type { PersonalityType } from '@/types/finance';
import { cn } from '@/utils/cn';

type PersonalityUnlockedViewProps = {
  type: PersonalityType;
  daysOfData: number;
  confidence: number;
  evidence: string[];
  tips: string[];
  className?: string;
};

export function PersonalityUnlockedView({
  type,
  daysOfData,
  confidence,
  evidence,
  tips,
  className,
}: PersonalityUnlockedViewProps) {
  // Drop the generic “Based on N days…” line — ConfidenceBar already shows it.
  const patterns = evidence.filter((line) => !/^Based on \d+ days?/i.test(line));

  return (
    <View className={cn('gap-5', className)}>
      <PersonalityHeroCard type={type} />
      <ConfidenceBar daysOfData={daysOfData} confidence={confidence} />

      {patterns.length > 0 ? (
        <View>
          <Text className="mb-2 text-base font-bold text-text">Your patterns</Text>
          <PatternList items={patterns} />
        </View>
      ) : null}

      {tips.length > 0 ? (
        <View>
          <Text className="mb-2 text-base font-bold text-text">Something to reflect on</Text>
          <ReflectCard tips={tips} />
        </View>
      ) : null}
    </View>
  );
}
