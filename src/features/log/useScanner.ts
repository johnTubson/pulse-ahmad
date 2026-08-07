import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useReducer, useRef } from 'react';
import { Alert } from 'react-native';

import { SCANNER_FAILURE_HEADER } from '@/features/log/components/ScannerFailureOverlay';
import { processingHeaderLabel } from '@/features/log/components/ScannerProcessingOverlay';
import {
  createInitialScannerState,
  firstRouteParam,
  ocrErrorMessage,
  scannerReducer,
} from '@/features/log/scannerReducer';
import { scanReceipt } from '@/services/ocr/scanReceipt';
import { useScanDraftStore } from '@/stores/scanDraftStore';

/** One-shot guard so a prefilled `uri` starts OCR from onLayout, not during render. */
let startedOcrForUri: string | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useScanner() {
  const params = useLocalSearchParams<{ source?: string; uri?: string }>();
  const initialUri = firstRouteParam(params.uri);
  const startInProcessing = Boolean(initialUri);

  const applyScan = useScanDraftStore((s) => s.applyScan);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [state, dispatch] = useReducer(scannerReducer, initialUri, createInitialScannerState);

  const finishWithResult = (imageUri: string, amount: number | null) => {
    startedOcrForUri = null;
    applyScan({ receiptUri: imageUri, amount });
    void Haptics.notificationAsync(
      amount != null
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
    router.back();
  };

  const runOcr = async (uri: string) => {
    dispatch({ type: 'OCR_START', uri });

    void (async () => {
      await sleep(450);
      dispatch({ type: 'OCR_STEP', step: 2 });
    })();

    try {
      const result = await scanReceipt(uri);
      dispatch({
        type: 'OCR_DONE',
        step: result.amount != null ? 3 : 2,
      });
      await sleep(500);
      finishWithResult(result.imageUri, result.amount);
    } catch (error) {
      // Defer applyScan until the user chooses "Enter amount manually" so
      // abandoning / retrying does not lock the log form in a failed scan state.
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dispatch({ type: 'OCR_FAIL', message: ocrErrorMessage(error) });
    } finally {
      dispatch({ type: 'SET_IDLE' });
    }
  };

  const enterAmountManually = () => {
    if (state.previewUri) {
      applyScan({ receiptUri: state.previewUri, amount: null });
    }
    startedOcrForUri = null;
    router.back();
  };

  const retryCapture = () => {
    // Keep the one-shot guard for a route `uri` so onLayout does not restart OCR.
    if (initialUri) startedOcrForUri = initialUri;
    else startedOcrForUri = null;
    dispatch({ type: 'RETRY_CAPTURE' });
  };

  const openLibrary = async () => {
    if (state.busy) return;
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!media.granted) {
      Alert.alert('Photos permission needed', 'Allow photo access to pick a receipt.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });

    if (picked.canceled || !picked.assets[0]?.uri) return;
    await runOcr(picked.assets[0].uri);
  };

  const takePicture = async () => {
    if (state.busy || !cameraRef.current) return;
    dispatch({ type: 'CAPTURE_START' });
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        dispatch({ type: 'CAPTURE_ABORT' });
        return;
      }
      await runOcr(photo.uri);
    } catch {
      dispatch({ type: 'CAPTURE_ABORT' });
      Alert.alert('Capture failed', 'Could not take a photo. Try again.');
    }
  };

  const close = () => {
    if (state.busy && state.phase === 'processing') return;
    startedOcrForUri = null;
    router.back();
  };

  const onRootLayout = () => {
    if (!initialUri || startedOcrForUri === initialUri) return;
    startedOcrForUri = initialUri;
    void runOcr(initialUri);
  };

  const showLiveCamera = state.phase === 'capture';
  const overlayStep = state.phase === 'done' ? 3 : state.step;
  const headerLabel =
    state.phase === 'capture'
      ? null
      : state.phase === 'failed'
        ? SCANNER_FAILURE_HEADER
        : processingHeaderLabel(overlayStep);

  return {
    cameraRef,
    permission,
    requestPermission,
    startInProcessing,
    phase: state.phase,
    previewUri: state.previewUri,
    step: overlayStep,
    busy: state.busy,
    flash: state.flash,
    failureMessage: state.failureMessage,
    showLiveCamera,
    headerLabel,
    libraryDisabled: state.busy && state.phase !== 'capture',
    shutterDisabled: !showLiveCamera || state.busy,
    toggleFlash: () => dispatch({ type: 'TOGGLE_FLASH' }),
    openLibrary,
    takePicture,
    close,
    enterAmountManually,
    retryCapture,
    onRootLayout,
  };
}
