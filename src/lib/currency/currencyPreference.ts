/** Module-level currency preference so `formatMoney` stays store-free (Jest-safe). */

let activeCurrency = 'USD';

export function getCurrencyPreference(): string {
  return activeCurrency;
}

export function setCurrencyPreference(currency: string): void {
  activeCurrency = currency || 'USD';
}
