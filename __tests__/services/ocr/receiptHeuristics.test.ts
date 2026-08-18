import { parseMerchant, parseReceiptDate } from '@/services/ocr/receiptHeuristics';

describe('parseMerchant', () => {
  it('returns null for empty text', () => {
    expect(parseMerchant('')).toBeNull();
    expect(parseMerchant('   ')).toBeNull();
  });

  it('picks the first non-meta line', () => {
    const text = ['WHOLE FOODS MARKET', '2024-03-01', 'TOTAL 45.00'].join('\n');
    expect(parseMerchant(text)).toBe('WHOLE FOODS MARKET');
  });

  it('skips total and thank-you lines', () => {
    const text = ['TOTAL 12.00', 'Thank you!', 'Corner Cafe'].join('\n');
    expect(parseMerchant(text)).toBe('Corner Cafe');
  });
});

describe('parseReceiptDate', () => {
  it('returns null for empty text', () => {
    expect(parseReceiptDate('')).toBeNull();
  });

  it('parses an ISO date', () => {
    const date = parseReceiptDate('Date: 2024-03-15\nTOTAL 10.00');
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(15);
  });

  it('parses a slash date with day first when day > 12', () => {
    const date = parseReceiptDate('15/03/2024\nCoffee');
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(15);
  });
});
