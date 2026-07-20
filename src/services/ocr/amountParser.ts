/**
 * Pure heuristic parser that extracts the probable total amount from raw OCR
 * text. It is intentionally dependency-free and fully unit-testable: feed it the
 * string an OCR API returns, get back a number (or null when nothing usable is
 * found). The UI always lets the user confirm or override the result.
 *
 * Heuristic: prefer amounts on a line mentioning "total" (ignoring "subtotal");
 * otherwise fall back to the largest currency-like number in the text — on most
 * receipts the grand total is the biggest figure.
 */

/** Currency-like number: optional symbol, thousands separators, optional decimals. */
const MONEY_PATTERN = /(?:[₦$€£]\s*)?(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g;

/** Strips dates and times so they aren't mistaken for monetary amounts. */
function removeTemporalTokens(text: string): string {
  return text
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ') // ISO dates
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, ' ') // slash dates
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?\b/gi, ' '); // times
}

/** Returns every currency-like number found in the text. */
export function extractAmounts(text: string): number[] {
  const amounts: number[] = [];
  const regex = new RegExp(MONEY_PATTERN);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const value = Number.parseFloat(match[1].replace(/,/g, ''));
    if (!Number.isNaN(value)) {
      amounts.push(value);
    }
  }
  return amounts;
}

/** Lines that reference a grand total, excluding subtotal lines. */
function totalLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => /total/i.test(line) && !/sub[-\s]?total/i.test(line));
}

/**
 * Extracts the most likely total amount from OCR text, or null when no
 * currency-like number can be found.
 */
export function parseAmount(text: string): number | null {
  if (!text || !text.trim()) {
    return null;
  }

  const cleaned = removeTemporalTokens(text);

  const totalCandidates = extractAmounts(totalLines(cleaned).join('\n'));
  if (totalCandidates.length > 0) {
    return Math.max(...totalCandidates);
  }

  const allAmounts = extractAmounts(cleaned);
  return allAmounts.length > 0 ? Math.max(...allAmounts) : null;
}
