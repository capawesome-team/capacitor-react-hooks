import { useEffect, useRef } from 'react';

export function useLatestRef<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function useMountedRef(): { readonly current: boolean } {
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref;
}

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

declare const process: { env?: { NODE_ENV?: string } } | undefined;

export function warnInDev(message: string, error: unknown): void {
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
    console.warn(`[@capawesome/capacitor-react-hooks] ${message}`, error);
  }
}
