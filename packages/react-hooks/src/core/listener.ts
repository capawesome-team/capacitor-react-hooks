import type { PluginListenerHandle } from '@capacitor/core';
import { useEffect } from 'react';

import { getCaptureEntry, subscribeToCapture } from './launch-events';
import { useLatestRef, warnInDev } from './util';

export interface ListenerPlugin {
  addListener(
    eventName: never,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listenerFunc: (...args: any[]) => void,
  ): Promise<PluginListenerHandle>;
}

export interface ListenerOptions {
  /** Set to `false` to detach the listener without unmounting. Default: `true`. */
  enabled?: boolean;
}

/**
 * Subscribes `callback` to a plugin event for the lifetime of the component.
 * Safe under StrictMode and handles the asynchronous `addListener` handle:
 * if the component unmounts before the handle resolves, the listener is
 * removed as soon as it becomes available.
 */
export function usePluginListener<TPayload>(
  plugin: ListenerPlugin,
  eventName: string,
  callback: (payload: TPayload) => void,
  options?: ListenerOptions,
): void {
  const callbackRef = useLatestRef(callback);
  const enabled = options?.enabled ?? true;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const deliver = (payload: unknown) => callbackRef.current(payload as TPayload);
    const captureEntry = getCaptureEntry(plugin, eventName);
    if (captureEntry) {
      return subscribeToCapture(captureEntry, deliver);
    }
    let removed = false;
    let handle: PluginListenerHandle | undefined;
    (plugin.addListener as (e: string, f: (payload: unknown) => void) => Promise<PluginListenerHandle>)(
      eventName,
      deliver,
    )
      .then(resolvedHandle => {
        if (removed) {
          void resolvedHandle.remove();
        } else {
          handle = resolvedHandle;
        }
      })
      .catch(error => warnInDev(`Failed to add listener for "${eventName}".`, error));
    return () => {
      removed = true;
      if (handle) {
        void handle.remove();
      }
    };
  }, [plugin, eventName, enabled, callbackRef]);
}

/**
 * Subscription helper for plugins using the callback-id idiom
 * (`start(callback) => Promise<CallbackId>` + `stop(callbackId)`), where errors
 * arrive in-band as the callback's second argument. `start` and `stop` must be
 * referentially stable (module-level functions or `useCallback`).
 */
export function useCallbackIdSubscription<TEvent>(
  start: (callback: (event: TEvent | null, error: unknown) => void) => Promise<string>,
  stop: (callbackId: string) => Promise<void>,
  onEvent: (event: TEvent) => void,
  onError?: (error: unknown) => void,
  options?: ListenerOptions,
): void {
  const onEventRef = useLatestRef(onEvent);
  const onErrorRef = useLatestRef(onError);
  const enabled = options?.enabled ?? true;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let stopped = false;
    let callbackId: string | undefined;
    const discardStopError = () => undefined;
    start((event, error) => {
      if (stopped) {
        return;
      }
      if (error) {
        onErrorRef.current?.(error);
      } else if (event) {
        onEventRef.current(event);
      }
    })
      .then(id => {
        if (stopped) {
          void stop(id).catch(discardStopError);
        } else {
          callbackId = id;
        }
      })
      .catch(error => onErrorRef.current?.(error));
    return () => {
      stopped = true;
      if (callbackId) {
        void stop(callbackId).catch(discardStopError);
      }
    };
  }, [start, stop, enabled, onEventRef, onErrorRef]);
}
