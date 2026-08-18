import {
  createInitialScannerState,
  firstRouteParam,
  ocrErrorMessage,
  scannerReducer,
} from '@/features/log/scannerReducer';
import { OcrError } from '@/services/ocr/types';

describe('createInitialScannerState', () => {
  it('starts in capture with no uri', () => {
    const state = createInitialScannerState();
    expect(state.phase).toBe('capture');
    expect(state.previewUri).toBeNull();
    expect(state.busy).toBe(false);
  });

  it('starts processing when a uri is provided', () => {
    const state = createInitialScannerState('file://receipt.jpg');
    expect(state.phase).toBe('processing');
    expect(state.previewUri).toBe('file://receipt.jpg');
  });
});

describe('scannerReducer', () => {
  const base = createInitialScannerState();

  it('toggles flash', () => {
    const on = scannerReducer(base, { type: 'TOGGLE_FLASH' });
    expect(on.flash).toBe('on');
    expect(scannerReducer(on, { type: 'TOGGLE_FLASH' }).flash).toBe('off');
  });

  it('enters processing on OCR start', () => {
    const next = scannerReducer(base, {
      type: 'OCR_START',
      uri: 'file://shot.jpg',
    });
    expect(next.phase).toBe('processing');
    expect(next.previewUri).toBe('file://shot.jpg');
    expect(next.step).toBe(1);
    expect(next.busy).toBe(true);
  });

  it('advances steps and marks done', () => {
    const started = scannerReducer(base, {
      type: 'OCR_START',
      uri: 'file://shot.jpg',
    });
    const step2 = scannerReducer(started, { type: 'OCR_STEP', step: 2 });
    expect(step2.step).toBe(2);
    const done = scannerReducer(step2, { type: 'OCR_DONE', step: 3 });
    expect(done.phase).toBe('done');
    expect(done.step).toBe(3);
  });

  it('clears busy on idle / abort', () => {
    const busy = scannerReducer(base, { type: 'CAPTURE_START' });
    expect(busy.busy).toBe(true);
    expect(scannerReducer(busy, { type: 'CAPTURE_ABORT' }).busy).toBe(false);
    expect(scannerReducer(busy, { type: 'SET_IDLE' }).busy).toBe(false);
  });

  it('enters failed with a user-facing message', () => {
    const started = scannerReducer(base, {
      type: 'OCR_START',
      uri: 'file://shot.jpg',
    });
    const failed = scannerReducer(started, {
      type: 'OCR_FAIL',
      message:
        'Something went wrong while reading this receipt. You can enter the amount manually.',
    });
    expect(failed.phase).toBe('failed');
    expect(failed.busy).toBe(false);
    expect(failed.failureMessage).toContain('Something went wrong');
  });

  it('returns to capture on retry', () => {
    const failed = scannerReducer(
      scannerReducer(base, { type: 'OCR_START', uri: 'file://shot.jpg' }),
      { type: 'OCR_FAIL', message: 'failed' },
    );
    const retried = scannerReducer(failed, { type: 'RETRY_CAPTURE' });
    expect(retried.phase).toBe('capture');
    expect(retried.previewUri).toBeNull();
    expect(retried.failureMessage).toBeNull();
    expect(retried.busy).toBe(false);
  });
});

describe('firstRouteParam', () => {
  it('unwraps array params', () => {
    expect(firstRouteParam(['a', 'b'])).toBe('a');
    expect(firstRouteParam('solo')).toBe('solo');
    expect(firstRouteParam(undefined)).toBeUndefined();
  });
});

describe('ocrErrorMessage', () => {
  it('returns generic copy for API / HTTP / missing key errors', () => {
    const generic =
      'Something went wrong while reading this receipt. You can enter the amount manually.';
    expect(
      ocrErrorMessage(new OcrError('API key not valid. Please pass a valid API key.', 'api')),
    ).toBe(generic);
    expect(ocrErrorMessage(new OcrError('{"error":{"message":"quota"}}', 'http'))).toBe(generic);
    expect(ocrErrorMessage(new OcrError('OCR API key is missing.', 'missing_key'))).toBe(generic);
    expect(ocrErrorMessage(new Error('network'))).toBe(generic);
    expect(ocrErrorMessage('weird')).toBe(generic);
  });

  it('returns a friendly empty-receipt message', () => {
    expect(ocrErrorMessage(new OcrError('No text found on this receipt.', 'empty'))).toBe(
      "We couldn't find a total on this receipt. You can enter it manually.",
    );
  });
});
