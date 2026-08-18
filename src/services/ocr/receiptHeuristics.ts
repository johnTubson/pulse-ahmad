/**
 * Heuristic merchant / date extraction from raw OCR text when a provider
 * does not return structured fields (e.g. Google Vision text-only).
 */

const DATE_PATTERNS: RegExp[] = [
  /\b(\d{4})-(\d{2})-(\d{2})\b/, // ISO
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/, // D/M/Y or M/D/Y
];

const SKIP_LINE =
  /^(total|sub\s*total|tax|vat|change|cash|card|visa|mastercard|thank|tel|phone|www\.|http|#|\d+$)/i;

function parseSlashDate(match: RegExpMatchArray): Date | null {
  const a = Number(match[1]);
  const b = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;

  // Prefer D/M/Y when day > 12; otherwise treat as M/D/Y (common on US receipts).
  let month: number;
  let day: number;
  if (a > 12) {
    day = a;
    month = b;
  } else if (b > 12) {
    month = a;
    day = b;
  } else {
    month = a;
    day = b;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function parseReceiptDate(text: string): Date | null {
  if (!text?.trim()) return null;

  for (const line of text.split(/\r?\n/)) {
    const iso = line.match(DATE_PATTERNS[0]);
    if (iso) {
      const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      if (!Number.isNaN(date.getTime())) return date;
    }

    const slash = line.match(DATE_PATTERNS[1]);
    if (slash) {
      const date = parseSlashDate(slash);
      if (date) return date;
    }
  }

  return null;
}

/**
 * Likely merchant: first non-empty line that is not a total/tax/date/phone line.
 * Caps length so the note field stays readable.
 */
export function parseMerchant(text: string): string | null {
  if (!text?.trim()) return null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/\s+/g, ' ');
    if (line.length < 2 || line.length > 48) continue;
    if (SKIP_LINE.test(line)) continue;
    if (DATE_PATTERNS[0].test(line) || DATE_PATTERNS[1].test(line)) continue;
    if (/^\d+[.,]\d{2}$/.test(line)) continue;
    return line;
  }

  return null;
}
