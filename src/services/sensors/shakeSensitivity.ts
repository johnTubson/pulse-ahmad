export const SHAKE_SENSITIVITY_OPTIONS = [1.2, 1.7, 2.2, 2.8] as const;

export type ShakeSensitivityOption = (typeof SHAKE_SENSITIVITY_OPTIONS)[number];

export const DEFAULT_SHAKE_SENSITIVITY: ShakeSensitivityOption = 1.7;
export const DEFAULT_SHAKE_TO_LOG_ENABLED = true;
