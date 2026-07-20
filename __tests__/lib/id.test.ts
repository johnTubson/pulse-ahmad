import { ulid } from '@/lib/id';
import { ulid as createUlid } from 'ulid';

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

describe('ulid', () => {
  it('produces a valid 26-character Crockford base32 ULID', () => {
    expect(ulid()).toMatch(ULID_RE);
  });

  it('produces unique values across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => ulid()));
    expect(ids.size).toBe(1000);
  });

  it('is lexicographically sortable by creation time', () => {
    const earlier = createUlid(1_700_000_000_000);
    const later = createUlid(1_700_000_000_001);
    expect(later > earlier).toBe(true);
  });
});
