/** Excess g above rest (~1g). Higher = harder to trigger. */
export const SHAKE_SENSITIVITY_OPTIONS = [
  { value: 0.5, label: 'Easy' },
  { value: 0.75, label: 'Normal' },
  { value: 1.1, label: 'Firm' },
  { value: 1.5, label: 'Hard' },
] as const;

export type ShakeSensitivityOption = (typeof SHAKE_SENSITIVITY_OPTIONS)[number]['value'];

export const DEFAULT_SHAKE_SENSITIVITY: ShakeSensitivityOption = 0.75;
export const DEFAULT_SHAKE_TO_LOG_ENABLED = true;
