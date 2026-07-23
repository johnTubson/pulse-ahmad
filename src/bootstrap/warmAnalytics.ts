import { scheduleIdle } from '@/utils/scheduleIdle';

let scheduled = false;

/**
 * After the first frame settles, preload analytics tab modules so the first
 * tab tap isn't stalled on a cold sync require of the list segment.
 */
export function warmAnalyticsModules(): void {
  if (scheduled) return;
  scheduled = true;

  scheduleIdle(() => {
    void import('../../app/(tabs)/analytics');
    void import('@/features/analytics/components/AnalyticsListSegment');
  });
}
