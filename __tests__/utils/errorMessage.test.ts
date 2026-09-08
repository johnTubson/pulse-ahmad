import { toUserErrorMessage } from '@/utils/errorMessage';

describe('toUserErrorMessage', () => {
  it('returns fallback for JSON-stringified dumps', () => {
    expect(toUserErrorMessage({ message: '{"status":500,"url":"https://x"}' })).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('returns fallback for HTTP 5xx auth errors', () => {
    expect(toUserErrorMessage({ message: 'Database error saving new user', status: 500 })).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('keeps short human-readable messages', () => {
    expect(toUserErrorMessage(new Error('Password should be at least 6 characters'))).toBe(
      'Password should be at least 6 characters',
    );
  });

  it('maps already-registered copy', () => {
    expect(toUserErrorMessage(new Error('User already registered'))).toBe(
      'An account with this email already exists.',
    );
  });
});
