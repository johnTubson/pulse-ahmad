import type { FlashMode } from 'expo-camera';

import { OcrError } from '@/services/ocr/client';

export type ProcessingStep = 1 | 2 | 3;

export type ScannerPhase = 'capture' | 'processing' | 'done' | 'failed';

export type ScannerState = {
  phase: ScannerPhase;
  previewUri: string | null;
  step: ProcessingStep;
  busy: boolean;
  flash: FlashMode;
  failureMessage: string | null;
};

export type ScannerAction =
  | { type: 'TOGGLE_FLASH' }
  | { type: 'OCR_START'; uri: string }
  | { type: 'OCR_STEP'; step: ProcessingStep }
  | { type: 'OCR_DONE'; step: ProcessingStep }
  | { type: 'OCR_FAIL'; message: string }
  | { type: 'RETRY_CAPTURE' }
  | { type: 'CAPTURE_START' }
  | { type: 'CAPTURE_ABORT' }
  | { type: 'SET_IDLE' };

export function createInitialScannerState(initialUri?: string): ScannerState {
  return {
    phase: initialUri ? 'processing' : 'capture',
    previewUri: initialUri ?? null,
    step: 1,
    busy: false,
    flash: 'off',
    failureMessage: null,
  };
}

export function scannerReducer(state: ScannerState, action: ScannerAction): ScannerState {
  switch (action.type) {
    case 'TOGGLE_FLASH':
      return { ...state, flash: state.flash === 'off' ? 'on' : 'off' };
    case 'OCR_START':
      return {
        ...state,
        previewUri: action.uri,
        phase: 'processing',
        step: 1,
        busy: true,
        failureMessage: null,
      };
    case 'OCR_STEP':
      return { ...state, step: action.step };
    case 'OCR_DONE':
      return { ...state, step: action.step, phase: 'done', failureMessage: null };
    case 'OCR_FAIL':
      return {
        ...state,
        phase: 'failed',
        busy: false,
        failureMessage: action.message,
      };
    case 'RETRY_CAPTURE':
      return {
        ...state,
        phase: 'capture',
        previewUri: null,
        step: 1,
        busy: false,
        failureMessage: null,
      };
    case 'CAPTURE_START':
      return { ...state, busy: true };
    case 'CAPTURE_ABORT':
    case 'SET_IDLE':
      return { ...state, busy: false };
    default:
      return state;
  }
}

export function firstRouteParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function ocrErrorMessage(error: unknown): string {
  if (error instanceof OcrError) {
    if (error.code === 'empty') {
      return "We couldn't find a total on this receipt. You can enter it manually.";
    }
    // api / http / missing_key — hide Vision payloads and config detail
    return 'Something went wrong while reading this receipt. You can enter the amount manually.';
  }
  return 'Something went wrong while reading this receipt. You can enter the amount manually.';
}
