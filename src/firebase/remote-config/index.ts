import type {
  AddConfigUpdateListenerOptionsCallback,
  AddConfigUpdateListenerOptionsCallbackEvent,
  CallbackId,
} from '@capacitor-firebase/remote-config';
import { FirebaseRemoteConfig } from '@capacitor-firebase/remote-config';
import { useCallback, useState } from 'react';

import { createMethodsHook, toError, useCallbackIdSubscription } from '../../core';
import type { ListenerOptions } from '../../core';

export interface UseConfigUpdateResult {
  /**
   * The keys whose values have been updated since the last activation, or
   * `undefined` until the first update arrives.
   */
  updatedKeys: string[] | undefined;
  /** The latest listener error, or `undefined` if the listener is healthy. */
  error: Error | undefined;
}

/** Plugin methods plus `isPluginAvailable`. */
export const useFirebaseRemoteConfig = createMethodsHook(
  'FirebaseRemoteConfig',
  FirebaseRemoteConfig,
  [
    'activate',
    'fetchAndActivate',
    'fetchConfig',
    'getAll',
    'getBoolean',
    'getInfo',
    'getNumber',
    'getString',
    'setDefaults',
    'setSettings',
  ],
);

/**
 * Subscribes to config updates for the lifetime of the component. The reported
 * keys have been fetched but are not active yet: call `activate()` before
 * reading their new values.
 *
 * Only available for Android and iOS. On Web the subscription fails and the
 * failure is exposed as `error` instead of being thrown.
 */
export function useConfigUpdate(options?: ListenerOptions): UseConfigUpdateResult {
  const [event, setEvent] = useState<AddConfigUpdateListenerOptionsCallbackEvent>();
  const [error, setError] = useState<Error>();
  const handleEvent = useCallback((nextEvent: AddConfigUpdateListenerOptionsCallbackEvent) => {
    setEvent(nextEvent);
    setError(undefined);
  }, []);
  const handleError = useCallback((nextError: unknown) => setError(toError(nextError)), []);
  useCallbackIdSubscription(
    addConfigUpdateListener,
    removeConfigUpdateListener,
    handleEvent,
    handleError,
    options,
  );
  return { updatedKeys: event?.updatedKeys, error };
}

function addConfigUpdateListener(
  callback: AddConfigUpdateListenerOptionsCallback,
): Promise<CallbackId> {
  return FirebaseRemoteConfig.addConfigUpdateListener(callback);
}

function removeConfigUpdateListener(id: CallbackId): Promise<void> {
  return FirebaseRemoteConfig.removeConfigUpdateListener({ id });
}
