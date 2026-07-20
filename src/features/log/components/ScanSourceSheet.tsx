import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { palette } from '@/constants/theme';

type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

type ScanSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onScanReceipt: () => void;
  onTakePhoto: () => void;
  onChooseLibrary: () => void;
};

type MenuRowProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  featured?: boolean;
  onPress: () => void;
};

function MenuRow({ icon, title, subtitle, featured = false, onPress }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
      onPress={onPress}
    >
      <View
        className={
          featured
            ? 'h-11 w-11 items-center justify-center rounded-xl bg-primary/10'
            : 'h-11 w-11 items-center justify-center rounded-xl bg-grey-100'
        }
      >
        <SymbolView name={icon} tintColor={featured ? palette.primary : palette.text} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text">{title}</Text>
        <Text className="text-sm text-text-muted">{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export function ScanSourceSheet({
  visible,
  onClose,
  onScanReceipt,
  onTakePhoto,
  onChooseLibrary,
}: ScanSourceSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss scan options"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-grey-300" />

          <View className="mb-3 overflow-hidden rounded-2xl bg-grey-100">
            <MenuRow
              featured
              icon={{ ios: 'viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
              title="Scan receipt"
              subtitle="Auto-detect the total with the camera"
              onPress={onScanReceipt}
            />
          </View>

          <View className="mb-5 overflow-hidden rounded-2xl bg-grey-100">
            <MenuRow
              icon={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
              title="Take photo"
              subtitle="Capture a receipt to attach"
              onPress={onTakePhoto}
            />
            <View className="ml-[68px] h-px bg-grey-200" />
            <MenuRow
              icon={{
                ios: 'photo.on.rectangle',
                android: 'photo_library',
                web: 'photo_library',
              }}
              title="Choose from library"
              subtitle="Pick an existing receipt photo"
              onPress={onChooseLibrary}
            />
          </View>

          <SecondaryButton label="Cancel" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
