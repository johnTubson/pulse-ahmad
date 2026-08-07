import { setCurrencyPreference } from '@/lib/currency/currencyPreference';
import { formatCompactMoney, formatMoney } from '@/lib/currency/formatMoney';

beforeEach(() => {
  setCurrencyPreference('USD');
});

describe('formatMoney', () => {
  it('formats positive amounts as USD', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });

  it('formats negative amounts', () => {
    expect(formatMoney(-42)).toBe('-$42.00');
  });

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('respects selected currency', () => {
    setCurrencyPreference('NGN');
    expect(formatMoney(1000)).toContain('1,000');
  });
});

describe('formatCompactMoney', () => {
  it('uses full format below 1K', () => {
    expect(formatCompactMoney(999)).toBe('$999.00');
  });

  it('abbreviates thousands', () => {
    expect(formatCompactMoney(1500)).toBe('$1.5K');
  });

  it('abbreviates millions', () => {
    expect(formatCompactMoney(2_500_000)).toBe('$2.5M');
  });

  it('preserves negative sign', () => {
    expect(formatCompactMoney(-2500)).toBe('-$2.5K');
  });
});
