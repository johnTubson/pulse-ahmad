import {
  extractRecognizeResultFromInterfaze,
  extractTextFromInterfazePrecontext,
  type InterfazeChatResponse,
} from '@/services/ocr/providers/interfaze';
import { OcrError } from '@/services/ocr/types';

describe('extractTextFromInterfazePrecontext', () => {
  it('prefers the ocr-named entry text field', () => {
    expect(
      extractTextFromInterfazePrecontext([
        { name: 'other', result: 'ignore' },
        { name: 'ocr', result: { text: 'TOTAL 9.99' } },
      ]),
    ).toBe('TOTAL 9.99');
  });

  it('accepts a plain string result', () => {
    expect(extractTextFromInterfazePrecontext([{ name: 'ocr', result: 'Hello' }])).toBe('Hello');
  });

  it('returns null when empty', () => {
    expect(extractTextFromInterfazePrecontext(undefined)).toBeNull();
    expect(extractTextFromInterfazePrecontext([])).toBeNull();
  });
});

describe('extractRecognizeResultFromInterfaze', () => {
  it('parses structured receipt JSON and keeps precontext text', () => {
    const body: InterfazeChatResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              merchant: 'Coffee Shop',
              amount: 4.5,
              date: '2026-08-10',
            }),
          },
        },
      ],
      precontext: [{ name: 'ocr', result: { text: 'Coffee Shop\nTOTAL 4.50' } }],
    };

    expect(extractRecognizeResultFromInterfaze(body)).toEqual({
      text: 'Coffee Shop\nTOTAL 4.50',
      amount: 4.5,
      merchant: 'Coffee Shop',
      date: '2026-08-10',
    });
  });

  it('falls back to precontext when content is not valid receipt JSON', () => {
    const body: InterfazeChatResponse = {
      choices: [{ message: { content: 'not-json' } }],
      precontext: [{ name: 'ocr', result: 'TOTAL 3.00' }],
    };

    expect(extractRecognizeResultFromInterfaze(body)).toEqual({
      text: 'TOTAL 3.00',
      amount: null,
      merchant: null,
      date: null,
    });
  });

  it('throws on API error object', () => {
    expect(() =>
      extractRecognizeResultFromInterfaze({
        error: { message: 'Invalid API key provided.' },
      }),
    ).toThrow(OcrError);
  });

  it('throws when nothing usable is present', () => {
    expect(() => extractRecognizeResultFromInterfaze({ choices: [] })).toThrow(OcrError);
  });
});
