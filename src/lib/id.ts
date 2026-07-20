import 'react-native-get-random-values';

import { ulid as createUlid } from 'ulid';

export function ulid(): string {
  return createUlid();
}
