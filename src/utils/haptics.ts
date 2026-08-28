import * as Haptics from 'expo-haptics';

export async function hapticImpact(style: Haptics.ImpactFeedbackStyle): Promise<void> {
  try {
    await Haptics.impactAsync(style);
  } catch {
    // Haptics unavailable on web or unsupported devices.
  }
}

export async function hapticNotification(type: Haptics.NotificationFeedbackType): Promise<void> {
  try {
    await Haptics.notificationAsync(type);
  } catch {
    // Haptics unavailable on web or unsupported devices.
  }
}

export function hapticLight(): void {
  void hapticImpact(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium(): void {
  void hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticSuccess(): void {
  void hapticNotification(Haptics.NotificationFeedbackType.Success);
}

export function hapticWarning(): void {
  void hapticNotification(Haptics.NotificationFeedbackType.Warning);
}

export function hapticError(): void {
  void hapticNotification(Haptics.NotificationFeedbackType.Error);
}
