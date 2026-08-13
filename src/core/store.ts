import type { PluginListenerHandle } from '@capacitor/core';
import { useSyncExternalStore } from 'react';

import type { ListenerPlugin } from './listener';
import { warnInDev } from './util';

export interface SharedStoreConfig<T> {
  /** Seeds the store with the current value when the first component subscribes. */
  load?: () => Promise<T>;
  /** Starts the underlying subscription; returns a teardown function. */
  subscribe: (emit: (value: T) => void) => () => void;
}

export interface SharedStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T | undefined;
  getServerSnapshot: () => undefined;
}

/**
 * A lazily started store shared by all subscribed components: one underlying
 * plugin listener regardless of how many components use the hook. The native
 * subscription starts with the first subscriber and stops with the last one.
 */
export function createSharedStore<T>(config: SharedStoreConfig<T>): SharedStore<T> {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  let teardown: (() => void) | undefined;
  let active = false;

  const emit = (next: T) => {
    value = next;
    listeners.forEach(listener => listener());
  };

  const start = () => {
    active = true;
    let emitted = false;
    teardown = config.subscribe(next => {
      emitted = true;
      emit(next);
    });
    config.load?.().then(
      loaded => {
        if (active && !emitted) {
          emit(loaded);
        }
      },
      error => warnInDev('Failed to load initial state.', error),
    );
  };

  const stop = () => {
    active = false;
    teardown?.();
    teardown = undefined;
  };

  return {
    subscribe: onChange => {
      listeners.add(onChange);
      if (listeners.size === 1) {
        start();
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          stop();
        }
      };
    },
    getSnapshot: () => value,
    getServerSnapshot: () => undefined,
  };
}

export function createPluginStateHook<T>(config: SharedStoreConfig<T>): () => T | undefined {
  const store = createSharedStore(config);
  return function usePluginState() {
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  };
}

/**
 * Adapts a plugin event to a `SharedStoreConfig#subscribe` function, handling
 * the asynchronous `addListener` handle safely.
 */
export function pluginEventSubscription<T>(
  plugin: ListenerPlugin,
  eventName: string,
): (emit: (value: T) => void) => () => void {
  return emit => {
    let removed = false;
    let handle: PluginListenerHandle | undefined;
    (plugin.addListener as (e: string, f: (payload: T) => void) => Promise<PluginListenerHandle>)(
      eventName,
      payload => emit(payload),
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
  };
}
