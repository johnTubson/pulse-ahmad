const FALLBACK = 'Something went wrong. Please try again.';

function looksLikeJsonDump(message: string): boolean {
  const trimmed = message.trim();
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}

export function toUserErrorMessage(error: unknown, fallback = FALLBACK): string {
  if (error == null) return fallback;

  let raw = '';
  let status: number | undefined;

  if (typeof error === 'string') {
    raw = error;
  } else if (typeof error === 'object') {
    const e = error as { message?: unknown; status?: number };
    status = typeof e.status === 'number' ? e.status : undefined;
    if (typeof e.message === 'string') raw = e.message.trim();
  }

  // Supabase auth-js stringifies the fetch Response for HTTP 5xx.
  if (!raw || looksLikeJsonDump(raw) || (status != null && status >= 500)) {
    return fallback;
  }

  const lower = raw.toLowerCase();
  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email before signing in.';
  }
  if (lower.includes('network request failed') || lower.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  if (raw.length > 160) return fallback;
  return raw;
}
