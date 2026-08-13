import type { Position, PositionOptions, WatchPositionCallback } from '@capacitor/geolocation';
import { Geolocation } from '@capacitor/geolocation';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  toError,
  useCallbackIdSubscription,
} from '../../core';

export interface UseWatchPositionResult {
  /** Last reported position; `undefined` until the first update arrives. */
  position: Position | undefined;
  error: Error | undefined;
}

/** Plugin methods plus `isAvailable`. */
export const useGeolocation = createMethodsHook('Geolocation', Geolocation, [
  'getCurrentPosition',
  'checkPermissions',
  'requestPermissions',
]);

/** Location permission status with imperative `check` and `request`. */
export const useGeolocationPermissions = createPermissionsHook(Geolocation);

/**
 * Watches the device position for the lifetime of the component and clears the
 * watch on unmount. Watching location is energy intensive, so mount this hook
 * only while the position is actually needed.
 *
 * `options` is captured on the first render: changing it afterwards has no
 * effect. Remount the component with a different `key` to apply new options.
 */
export function useWatchPosition(options?: PositionOptions): UseWatchPositionResult {
  const optionsRef = useRef(options);
  const [position, setPosition] = useState<Position>();
  const [error, setError] = useState<Error>();
  const startWatch = useCallback(
    (callback: WatchPositionCallback) =>
      Geolocation.watchPosition(optionsRef.current ?? {}, callback),
    [],
  );
  useCallbackIdSubscription<Position>(
    startWatch,
    clearWatch,
    nextPosition => {
      setPosition(nextPosition);
      setError(undefined);
    },
    caught => setError(toError(caught)),
  );
  return useMemo(() => ({ position, error }), [position, error]);
}

function clearWatch(id: string): Promise<void> {
  return Geolocation.clearWatch({ id });
}
