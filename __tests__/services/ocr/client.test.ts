import {
  extractTextFromVisionResponse,
  OcrError,
  type VisionAnnotateResponse,
} from '@/services/ocr/client';

describe('extractTextFromVisionResponse', () => {
  it('prefers fullTextAnnotation text', () => {
    const body: VisionAnnotateResponse = {
      responses: [
        {
          fullTextAnnotation: { text: 'TOTAL 12.50\n' },
          textAnnotations: [{ description: 'TOTAL 12.50' }],
        },
      ],
    };
    expect(extractTextFromVisionResponse(body)).toBe('TOTAL 12.50');
  });

  it('falls back to the first textAnnotation', () => {
    const body: VisionAnnotateResponse = {
      responses: [{ textAnnotations: [{ description: 'Coffee 4.00' }] }],
    };
    expect(extractTextFromVisionResponse(body)).toBe('Coffee 4.00');
  });

  it('throws when the top-level error is set', () => {
    expect(() => extractTextFromVisionResponse({ error: { message: 'API key invalid' } })).toThrow(
      OcrError,
    );
  });

  it('throws when a response error is set', () => {
    expect(() =>
      extractTextFromVisionResponse({
        responses: [{ error: { message: 'Bad image data' } }],
      }),
    ).toThrow(/Bad image data/);
  });

  it('throws when no text is present', () => {
    expect(() => extractTextFromVisionResponse({ responses: [{}] })).toThrow(OcrError);
  });
});
