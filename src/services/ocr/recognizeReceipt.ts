import { env } from '@/constants/env';
import { recognizeWithGoogleVision } from '@/services/ocr/providers/googleVision';
import { recognizeWithInterfaze } from '@/services/ocr/providers/interfaze';
import { recognizeWithOcrSpace } from '@/services/ocr/providers/ocrSpace';
import type { RecognizeResult } from '@/services/ocr/types';

/** Dispatches to the provider selected by `EXPO_PUBLIC_OCR_PROVIDER` (default: google). */
export async function recognizeReceipt(base64Image: string): Promise<RecognizeResult> {
  switch (env.ocrProvider) {
    case 'ocrspace':
      return recognizeWithOcrSpace(base64Image);
    case 'interfaze':
      return recognizeWithInterfaze(base64Image);
    case 'google':
      return recognizeWithGoogleVision(base64Image);
  }
}
