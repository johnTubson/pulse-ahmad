import {
  extractTextFromOcrSpaceResponse,
  type OcrSpaceResponse,
} from '@/services/ocr/providers/ocrSpace';
import { OcrError } from '@/services/ocr/types';

describe('extractTextFromOcrSpaceResponse', () => {
  it('joins successful ParsedText pages', () => {
    const body: OcrSpaceResponse = {
      OCRExitCode: 1,
      IsErroredOnProcessing: false,
      ParsedResults: [
        { FileParseExitCode: 1, ParsedText: 'Coffee\nTOTAL 4.00' },
        { FileParseExitCode: 1, ParsedText: 'Page 2' },
      ],
    };
    expect(extractTextFromOcrSpaceResponse(body)).toBe('Coffee\nTOTAL 4.00\n\nPage 2');
  });

  it('keeps partial success pages (OCRExitCode 2)', () => {
    const body: OcrSpaceResponse = {
      OCRExitCode: '2',
      ParsedResults: [
        { FileParseExitCode: 1, ParsedText: 'TOTAL 12.50' },
        { FileParseExitCode: -10, ParsedText: null, ErrorMessage: 'OCR Engine Parse Error' },
      ],
    };
    expect(extractTextFromOcrSpaceResponse(body)).toBe('TOTAL 12.50');
  });

  it('throws when processing errored with a message', () => {
    expect(() =>
      extractTextFromOcrSpaceResponse({
        IsErroredOnProcessing: true,
        ErrorMessage: 'Invalid API key',
      }),
    ).toThrow(OcrError);
  });

  it('throws on fatal OCRExitCode', () => {
    expect(() =>
      extractTextFromOcrSpaceResponse({
        OCRExitCode: 3,
        ErrorMessage: ['All pages failed'],
      }),
    ).toThrow(/All pages failed/);
  });

  it('throws when no successful text exists', () => {
    expect(() =>
      extractTextFromOcrSpaceResponse({
        OCRExitCode: 1,
        ParsedResults: [{ FileParseExitCode: -30, ErrorMessage: 'Validation Error' }],
      }),
    ).toThrow(/Validation Error/);
  });
});
