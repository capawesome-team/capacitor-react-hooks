import type {
  Position,
  PositionChangeEvent,
  PositionErrorEvent,
  StartWatchingOptions,
  SyncFailedEvent,
} from '@capawesome-team/capacitor-background-geolocation';
import { BackgroundGeolocation } from '@capawesome-team/capacitor-background-geolocation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardStopError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS. `requestTemporaryFullAccuracy` is only
 * available on iOS.
 */
export const useBackgroundGeolocation = createMethodsHook(
  'BackgroundGeolocation',
  BackgroundGeolocation,
  [
    'clearSyncQueue',
    'getCurrentPosition',
    'getSyncStatus',
    'isWatching',
    'openSettings',
    'requestTemporaryFullAccuracy',
    'startWatching',
    'stopWatching',
    'triggerSync',
    'checkPermissions',
    'requestPermissions',
  ],
);

/**
 * The location permission status, checked on mount.
 *
 * The `backgroundLocation` permission must be requested in a second, separate
 * call after the `location` permission has been granted.
 *
 * Only available on Android and iOS.
 */
export const useBackgroundGeolocationPermissions = createPermissionsHook(BackgroundGeolocation);

/** The state and controls of a watch session. */
export interface UseBackgroundGeolocationWatchSessionResult {
  /** Starts a watch session. Rejects if the session cannot be started. */
  start: (options?: StartWatchingOptions) => Promise<void>;
  /** Stops the running watch session. */
  stop: () => Promise<void>;
  isWatching: boolean;
  /** The most recent position of the running session; `undefined` until the first position arrives. */
  position: Position | undefined;
  /** The most recent error of the running session; `undefined` until an error occurs. */
  error: PositionErrorEvent | undefined;
}

/**
 * A watch session bound to the component lifecycle: `start` attaches the
 * `positionChange` and `positionError` listeners and starts watching, `stop`
 * reverses both. Unmounting while watching stops the session.
 *
 * Only one watch session can be active at a time. On Android, the
 * `androidNotification` option must be provided.
 *
 * Only available on Android and iOS.
 */
export function useBackgroundGeolocationWatchSession(): UseBackgroundGeolocationWatchSessionResult {
  const [isWatching, setIsWatching] = useState(false);
  const [position, setPosition] = useState<Position>();
  const [error, setError] = useState<PositionErrorEvent>();
  const isWatchingRef = useRef(false);
  const mountedRef = useMountedRef();

  usePluginListener<PositionChangeEvent>(
    BackgroundGeolocation,
    'positionChange',
    event => setPosition(event.position),
    { enabled: isWatching },
  );
  usePluginListener<PositionErrorEvent>(
    BackgroundGeolocation,
    'positionError',
    event => setError(event),
    { enabled: isWatching },
  );

  const setWatching = useCallback(
    (next: boolean) => {
      isWatchingRef.current = next;
      if (mountedRef.current) {
        setIsWatching(next);
      }
    },
    [mountedRef],
  );

  const start = useCallback(
    async (options?: StartWatchingOptions) => {
      setPosition(undefined);
      setError(undefined);
      setWatching(true);
      try {
        await BackgroundGeolocation.startWatching(options);
      } catch (caught) {
        setWatching(false);
        throw caught;
      }
    },
    [setWatching],
  );

  const stop = useCallback(async () => {
    setWatching(false);
    await BackgroundGeolocation.stopWatching();
  }, [setWatching]);

  useEffect(
    () => () => {
      if (!isWatchingRef.current) {
        return;
      }
      isWatchingRef.current = false;
      void BackgroundGeolocation.stopWatching().catch(discardStopError);
    },
    [],
  );

  return useMemo(
    () => ({ start, stop, isWatching, position, error }),
    [start, stop, isWatching, position, error],
  );
}

/**
 * Invokes `callback` whenever a new position is available. Positions are only
 * emitted while a watch session is active: start one with `startWatching` or
 * use `useBackgroundGeolocationWatchSession`, which does both.
 *
 * Position events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android and iOS.
 */
export function useBackgroundGeolocationPositionChange(
  callback: (event: PositionChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BackgroundGeolocation, 'positionChange', callback, options);
}

/**
 * Invokes `callback` whenever an error occurs during an active watch session,
 * for example when the user disables the location services.
 *
 * Only available on Android and iOS.
 */
export function useBackgroundGeolocationPositionError(
  callback: (event: PositionErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BackgroundGeolocation, 'positionError', callback, options);
}

/**
 * Invokes `callback` whenever an upload attempt of buffered positions fails.
 *
 * Only available on Android and iOS.
 */
export function useBackgroundGeolocationSyncFailed(
  callback: (event: SyncFailedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BackgroundGeolocation, 'syncFailed', callback, options);
}
