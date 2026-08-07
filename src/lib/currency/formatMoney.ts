import { getCurrencyPreference } from '@/lib/currency/currencyPreference';

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat {
  const cached = formatterCache.get(currency);
  if (cached) return cached;
  const next = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  formatterCache.set(currency, next);
  return next;
}

export function formatMoney(amount: number): string {
  const currency = getCurrencyPreference();
  try {
    return formatterFor(currency).format(amount);
  } catch {
    return formatterFor('USD').format(amount);
  }
}

export function formatCompactMoney(amount: number): string {
  const currency = getCurrencyPreference();
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  let prefix = '$';
  try {
    prefix =
      formatterFor(currency)
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? '$';
  } catch {
    prefix = '$';
  }
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(1)}K`;
  return formatMoney(amount);
}
