import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import {
  PERSONALITY_DISPLAY_LABELS,
  PERSONALITY_GRADIENTS,
  PERSONALITY_HERO_COPY,
  PERSONALITY_HERO_EMOJI,
} from '@/features/personality/lib/display';
import type { PersonalityType } from '@/types/finance';

type PersonalityHeroCardProps = {
  type: PersonalityType;
};

export function PersonalityHeroCard({ type }: PersonalityHeroCardProps) {
  const [from, to] = PERSONALITY_GRADIENTS[type];

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ borderRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28 }}
    >
      <View className="mb-4 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-white/40">
          <Text className="text-5xl">{PERSONALITY_HERO_EMOJI[type]}</Text>
        </View>
      </View>
      <Text className="text-center text-2xl font-bold text-text">
        {PERSONALITY_DISPLAY_LABELS[type]}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-text/80">
        {PERSONALITY_HERO_COPY[type]}
      </Text>
    </LinearGradient>
  );
}
