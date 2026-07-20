import { extractAmounts, parseAmount } from '@/services/ocr/amountParser';

describe('extractAmounts', () => {
  it('extracts plain and comma-separated numbers', () => {
    expect(extractAmounts('Item 1,200.50 and 45')).toEqual([1200.5, 45]);
  });

  it('extracts amounts with currency symbols', () => {
    expect(extractAmounts('Total: ₦4,000  $12.99')).toEqual([4000, 12.99]);
  });

  it('returns an empty array when there are no numbers', () => {
    expect(extractAmounts('no digits here')).toEqual([]);
  });
});

describe('parseAmount', () => {
  it('returns null for empty or whitespace input', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
  });

  it('returns null when no amounts are present', () => {
    expect(parseAmount('THANK YOU FOR SHOPPING')).toBeNull();
  });

  it('parses a single total', () => {
    expect(parseAmount('TOTAL $45.00')).toBe(45);
  });

  it('prefers the amount on a "total" line over larger line items', () => {
    const receipt = ['Big TV 9,999.00', 'Discount 500.00', 'TOTAL 2,500.00'].join('\n');
    expect(parseAmount(receipt)).toBe(2500);
  });

  it('ignores subtotal lines when a total line exists', () => {
    const receipt = ['Subtotal 1,800.00', 'Tax 200.00', 'Total 2,000.00'].join('\n');
    expect(parseAmount(receipt)).toBe(2000);
  });

  it('falls back to the largest amount when no total keyword is present', () => {
    const receipt = ['Coffee 3.50', 'Sandwich 8.75', 'Water 1.20'].join('\n');
    expect(parseAmount(receipt)).toBe(8.75);
  });

  it('handles currency symbols and thousands separators', () => {
    expect(parseAmount('GRAND TOTAL: ₦12,450.75')).toBe(12450.75);
  });

  it('does not mistake dates or times for amounts', () => {
    const receipt = ['Date 2026-07-15 14:30', 'Total $9.99'].join('\n');
    expect(parseAmount(receipt)).toBe(9.99);
  });

  it('recovers when a total line has no number by scanning the whole receipt', () => {
    const receipt = ['TOTAL DUE', '2,300.00'].join('\n');
    expect(parseAmount(receipt)).toBe(2300);
  });
});
