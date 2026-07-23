import { Text, View } from 'react-native';

import { MOOD_META } from '@/constants/mood';
import { palette } from '@/constants/theme';
import type { MoodValue } from '@/types/finance';
import { cn } from '@/utils/cn';

export type ScatterPoint = {
  /** Mood 1–5 (may be fractional day average). */
  mood: number;
  spend: number;
};

type ScatterChartCardProps = {
  data: ScatterPoint[];
  summary: string;
  className?: string;
};

const PLOT_HEIGHT = 190;
const DOT_SIZE = 12;
const MOOD_TICKS: MoodValue[] = [1, 2, 3, 4, 5];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function ScatterChartCard({ data, summary, className }: ScatterChartCardProps) {
  const maxSpend = Math.max(...data.map((d) => d.spend), 1);

  return (
    <View className={cn('overflow-hidden rounded-3xl bg-rose-50 px-3 py-3', className)}>
      {data.length === 0 ? (
        <View className="items-center py-10">
          <Text className="text-sm text-text-muted">
            Log moods with spends to unlock this chart
          </Text>
        </View>
      ) : (
        <>
          <View className="relative w-full" style={{ height: PLOT_HEIGHT }}>
            {/* Subtle horizontal guides */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <View
                key={frac}
                className="absolute left-0 right-0 border-t border-rose-100"
                style={{ top: PLOT_HEIGHT * frac }}
              />
            ))}

            {data.map((point, index) => {
              const mood = clamp(point.mood, 1, 5);
              const leftPct = ((mood - 1) / 4) * 100;
              const topPct = 1 - point.spend / (maxSpend * 1.15);
              return (
                <View
                  key={`${point.mood}-${point.spend}-${index}`}
                  className="absolute rounded-full"
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    backgroundColor: palette.expense,
                    left: `${leftPct}%`,
                    top: `${clamp(topPct, 0.05, 0.92) * 100}%`,
                    marginLeft: -DOT_SIZE / 2,
                    marginTop: -DOT_SIZE / 2,
                  }}
                />
              );
            })}
          </View>

          <View className="mt-2 flex-row">
            {MOOD_TICKS.map((mood) => (
              <View key={mood} className="flex-1 items-center">
                <Text className="text-base">{MOOD_META[mood].emoji}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text className="mt-3 px-1 text-center text-sm text-text">{summary}</Text>
    </View>
  );
}
