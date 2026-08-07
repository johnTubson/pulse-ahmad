import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type CircularProgressProps = {
  /** 0–1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function CircularProgress({
  progress,
  size = 160,
  strokeWidth = 14,
  className,
}: CircularProgressProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  const center = size / 2;

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={palette.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={palette.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-4xl font-bold text-text">{pct}%</Text>
      </View>
    </View>
  );
}
