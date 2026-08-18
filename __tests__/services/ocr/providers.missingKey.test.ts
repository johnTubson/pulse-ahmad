import { recognizeWithGoogleVision } from '@/services/ocr/providers/googleVision';
import { recognizeWithInterfaze } from '@/services/ocr/providers/interfaze';
import { recognizeWithOcrSpace } from '@/services/ocr/providers/ocrSpace';
import { OcrError } from '@/services/ocr/types';

jest.mock('@/constants/env', () => ({
  env: {
    ocrProvider: 'google',
    ocrApiKey: '',
    ocrSpaceApiKey: '',
    ocrSpaceUrl: '',
    interfazeApiKey: '',
  },
}));

describe('OCR providers missing keys', () => {
  it('google throws missing_key when Vision key is empty', async () => {
    await expect(recognizeWithGoogleVision('abc')).rejects.toBeInstanceOf(OcrError);
    await expect(recognizeWithGoogleVision('abc')).rejects.toMatchObject({ code: 'missing_key' });
  });

  it('ocrspace throws missing_key when OCR.space key is empty', async () => {
    await expect(recognizeWithOcrSpace('abc')).rejects.toMatchObject({ code: 'missing_key' });
  });

  it('interfaze throws missing_key when Interfaze key is empty', async () => {
    await expect(recognizeWithInterfaze('abc')).rejects.toMatchObject({ code: 'missing_key' });
  });
});
