import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';

/** Once native haptics fail, skip further bridge calls on this session. */
let unavailable = false;

async function hapticImpact(style: Haptics.ImpactFeedbackStyle): Promise<void> {
  if (isWeb || unavailable) return;

  if (isAndroid) {
    const type =
      style === Haptics.ImpactFeedbackStyle.Medium
        ? Haptics.AndroidHaptics.Keyboard_Tap
        : Haptics.AndroidHaptics.Context_Click;
    try {
      await Haptics.performAndroidHapticsAsync(type);
      return;
    } catch {
      // Fall back to impactAsync (may require VIBRATE on older devices).
    }
  }

  try {
    await Haptics.impactAsync(style);
  } catch {
    unavailable = true;
  }
}

async function hapticNotification(type: Haptics.NotificationFeedbackType): Promise<void> {
  if (isWeb || unavailable) return;

  if (isAndroid) {
    const androidType =
      type === Haptics.NotificationFeedbackType.Success
        ? Haptics.AndroidHaptics.Confirm
        : type === Haptics.NotificationFeedbackType.Error
          ? Haptics.AndroidHaptics.Reject
          : Haptics.AndroidHaptics.Long_Press;
    try {
      await Haptics.performAndroidHapticsAsync(androidType);
      return;
    } catch {
      // Fall back to notificationAsync.
    }
  }

  try {
    await Haptics.notificationAsync(type);
  } catch {
    unavailable = true;
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
