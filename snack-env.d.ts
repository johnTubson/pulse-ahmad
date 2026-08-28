import type { RequireContext } from 'expo-router';

declare global {
  interface NodeRequire {
    context(path: string, recursive?: boolean, filter?: RegExp): RequireContext;
  }
}

export {};
