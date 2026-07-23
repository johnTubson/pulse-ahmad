type IdleRequestCallback = (deadline?: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void;

/**
 * Schedule non-urgent work when the JS thread is idle.
 * Prefer this over deprecated `InteractionManager.runAfterInteractions`.
 */
export function scheduleIdle(task: () => void, timeoutMs = 500): void {
  const ric = (
    globalThis as typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: { timeout?: number },
      ) => number;
    }
  ).requestIdleCallback;

  if (typeof ric === 'function') {
    ric(() => task(), { timeout: timeoutMs });
    return;
  }

  // Hermes / older runtimes: yield to paint, then run.
  requestAnimationFrame(() => {
    setTimeout(task, 0);
  });
}
