import { useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';

/**
 * Chart plot width. Seeds from the window so gifted-charts can mount on the
 * first paint (avoids empty → onLayout → remount jank). `onLayout` corrects
 * when the real card width differs (e.g. different parent padding).
 *
 * @param horizontalInset Total horizontal padding outside the measured view
 *   (analytics content uses `px-5` → 40).
 */
export function useChartWidth(horizontalInset = 40): {
  width: number;
  onLayout: (event: LayoutChangeEvent) => void;
} {
  const { width: windowWidth } = useWindowDimensions();
  const estimated = Math.max(0, Math.round(windowWidth - horizontalInset));
  const [measured, setMeasured] = useState<number | null>(null);
  const width = measured ?? estimated;

  return {
    width,
    onLayout: (event: LayoutChangeEvent) => {
      const next = Math.round(event.nativeEvent.layout.width);
      if (next > 0 && next !== width) setMeasured(next);
    },
  };
}
