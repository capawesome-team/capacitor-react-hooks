import { useCallback, useEffect, useMemo, useState } from 'react';

import { toError, useMountedRef } from './util';

export interface PermissionsPlugin<TStatus, TRequestOptions> {
  checkPermissions(): Promise<TStatus>;
  requestPermissions(options?: TRequestOptions): Promise<TStatus>;
}

export interface UsePermissionsResult<TStatus, TRequestOptions> {
  /** Last known permission status; `undefined` until the initial check resolves. */
  status: TStatus | undefined;
  error: Error | undefined;
  check: () => Promise<TStatus | undefined>;
  request: (options?: TRequestOptions) => Promise<TStatus | undefined>;
}

/**
 * Creates a permissions hook around the standard Capacitor
 * `checkPermissions` / `requestPermissions` pair. The hook checks on mount and
 * exposes imperative `check` / `request` that keep `status` in sync.
 */
export function createPermissionsHook<TStatus, TRequestOptions = void>(
  plugin: PermissionsPlugin<TStatus, TRequestOptions>,
): () => UsePermissionsResult<TStatus, TRequestOptions> {
  return function usePermissions() {
    const [status, setStatus] = useState<TStatus>();
    const [error, setError] = useState<Error>();
    const mountedRef = useMountedRef();
    const run = useCallback(
      async (operation: () => Promise<TStatus>) => {
        try {
          const next = await operation();
          if (mountedRef.current) {
            setStatus(next);
            setError(undefined);
          }
          return next;
        } catch (caught) {
          if (mountedRef.current) {
            setError(toError(caught));
          }
          return undefined;
        }
      },
      [mountedRef],
    );
    const check = useCallback(() => run(() => plugin.checkPermissions()), [run]);
    const request = useCallback(
      (options?: TRequestOptions) => run(() => plugin.requestPermissions(options)),
      [run],
    );
    useEffect(() => {
      void check();
    }, [check]);
    return useMemo(() => ({ status, error, check, request }), [status, error, check, request]);
  };
}
