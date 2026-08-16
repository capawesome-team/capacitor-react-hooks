import { SecurePreferences } from '@capawesome-team/capacitor-secure-preferences';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { createMethodsHook, createSharedStore } from '../../core';
import type { SharedStore } from '../../core';

export interface UseSecurePreferenceResult {
  /** `undefined` until the stored value is loaded, `null` when no value is stored. */
  value: string | null | undefined;
  set: (value: string) => Promise<void>;
  remove: () => Promise<void>;
}

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * On **Web**, values are stored unencrypted in `localStorage`. This is for
 * development purposes only and should not be used in production.
 */
export const useSecurePreferences = createMethodsHook('SecurePreferences', SecurePreferences, [
  'clear',
  'get',
  'keys',
  'remove',
  'set',
]);

/**
 * The stored value for `key`, loaded on mount and shared by every component
 * using the same key. `value` is `undefined` while loading and `null` when the
 * key is not set.
 *
 * The plugin emits no change event: only writes made through the returned `set`
 * and `remove` update the mounted hooks. Writes made directly through the
 * `SecurePreferences` plugin bypass this notification.
 */
export function useSecurePreference(key: string): UseSecurePreferenceResult {
  const store = useMemo(() => getStore(key), [key]);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const set = useCallback(
    async (nextValue: string) => {
      await SecurePreferences.set({ key, value: nextValue });
      notify(key, nextValue);
    },
    [key],
  );
  const remove = useCallback(async () => {
    await SecurePreferences.remove({ key });
    notify(key, null);
  }, [key]);
  return useMemo(() => ({ value, set, remove }), [value, set, remove]);
}

type SecurePreferenceValue = string | null;
type SecurePreferenceEmit = (value: SecurePreferenceValue) => void;

const storesByKey = new Map<string, SharedStore<SecurePreferenceValue>>();
const emittersByKey = new Map<string, Set<SecurePreferenceEmit>>();

function getStore(key: string): SharedStore<SecurePreferenceValue> {
  const existingStore = storesByKey.get(key);
  if (existingStore) {
    return existingStore;
  }
  const store = createSharedStore<SecurePreferenceValue>({
    load: () => SecurePreferences.get({ key }).then(result => result.value),
    subscribe: emit => {
      const emitters = emittersByKey.get(key) ?? new Set<SecurePreferenceEmit>();
      emitters.add(emit);
      emittersByKey.set(key, emitters);
      return () => {
        emitters.delete(emit);
        if (emitters.size === 0) {
          emittersByKey.delete(key);
        }
      };
    },
  });
  storesByKey.set(key, store);
  return store;
}

function notify(key: string, value: SecurePreferenceValue): void {
  emittersByKey.get(key)?.forEach(emit => emit(value));
}
