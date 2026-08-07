import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { Dispatch } from 'react';
import { Alert } from 'react-native';

import type { LogFormAction } from '@/features/log/logFormReducer';

/**
 * Scan-source sheet actions: open camera scanner or pick from library then process.
 */
export function useReceiptScan(dispatch: Dispatch<LogFormAction>) {
  const openCameraScanner = () => {
    dispatch({ type: 'CLOSE_SCAN_SHEET' });
    router.push('/scan');
  };

  const openLibraryScanner = () => {
    dispatch({ type: 'CLOSE_SCAN_SHEET' });
    void (async () => {
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
      router.push({ pathname: '/scan', params: { uri: picked.assets[0].uri } });
    })();
  };

  return { openCameraScanner, openLibraryScanner };
}
