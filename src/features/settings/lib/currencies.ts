export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];
