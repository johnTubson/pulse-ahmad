import { CameraView } from 'expo-camera';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { palette } from '@/constants/theme';
import { ScannerFailureOverlay } from '@/features/log/components/ScannerFailureOverlay';
import { ScannerProcessingOverlay } from '@/features/log/components/ScannerProcessingOverlay';
import { useScanner } from '@/features/log/useScanner';

export function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const {
    cameraRef,
    permission,
    requestPermission,
    startInProcessing,
    phase,
    previewUri,
    step,
    flash,
    failureMessage,
    showLiveCamera,
    headerLabel,
    libraryDisabled,
    shutterDisabled,
    toggleFlash,
    openLibrary,
    takePicture,
    close,
    enterAmountManually,
    retryCapture,
    onRootLayout,
  } = useScanner();

  if (!permission && !startInProcessing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!startInProcessing && permission && !permission.granted) {
    return (
      <View
        className="flex-1 justify-center bg-background px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="mb-2 text-center text-xl font-bold text-text">Camera access</Text>
        <Text className="mb-6 text-center text-base text-text-muted">
          Pulse needs the camera to scan receipts and pre-fill the amount.
        </Text>
        <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
        <View className="h-3" />
        <SecondaryButton label="Cancel" onPress={close} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      onLayout={onRootLayout}
    >
      <View className="flex-row items-center justify-between px-5 pb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
          className="h-10 w-10 items-center justify-center rounded-xl bg-grey-100 active:opacity-70"
          onPress={close}
        >
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            tintColor={palette.text}
            size={16}
          />
        </Pressable>

        {headerLabel ? (
          <Text className="text-base font-semibold text-text">{headerLabel}</Text>
        ) : (
          <View className="w-10" />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={flash === 'off' ? 'Turn flash on' : 'Turn flash off'}
          className="h-10 w-10 items-center justify-center rounded-full bg-grey-100 active:opacity-70"
          onPress={toggleFlash}
          disabled={!showLiveCamera}
        >
          <SymbolView
            name={
              flash === 'off'
                ? { ios: 'bolt.slash.fill', android: 'flash_off', web: 'flash_off' }
                : { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' }
            }
            tintColor={palette.text}
            size={16}
          />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="aspect-[3/4] w-full overflow-hidden rounded-3xl border-2 border-dashed border-grey-300 bg-grey-100">
          {showLiveCamera ? (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              flash={flash}
              mode="picture"
            />
          ) : previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={palette.primary} />
            </View>
          )}
        </View>

        {phase === 'capture' ? (
          <Text className="mt-4 text-center text-base font-medium text-text">
            Align receipt within the frame
          </Text>
        ) : phase === 'failed' && failureMessage ? (
          <ScannerFailureOverlay
            className="mt-5 w-full"
            message={failureMessage}
            onEnterManually={enterAmountManually}
            onTryAgain={retryCapture}
          />
        ) : (
          <ScannerProcessingOverlay className="mt-5 w-full" step={step} />
        )}
      </View>

      <View
        className="flex-row items-center px-8 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose from library"
          className="h-12 w-12 items-center justify-center rounded-xl bg-grey-100 active:opacity-70"
          onPress={() => void openLibrary()}
          disabled={libraryDisabled}
        >
          <SymbolView
            name={{
              ios: 'photo.on.rectangle',
              android: 'photo_library',
              web: 'photo_library',
            }}
            tintColor={palette.text}
            size={20}
          />
        </Pressable>

        <View className="flex-1 items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture receipt"
            className="h-20 w-20 items-center justify-center rounded-full border-[6px] border-grey-200 bg-white active:opacity-80"
            onPress={() => void takePicture()}
            disabled={shutterDisabled}
          >
            <View className="h-14 w-14 rounded-full bg-white" />
          </Pressable>
        </View>

        <View className="w-12" />
      </View>
    </View>
  );
}
