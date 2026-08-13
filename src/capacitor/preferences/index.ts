import { Preferences } from '@capacitor/preferences';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { createMethodsHook, createSharedStore } from '../../core';
import type { SharedStore } from '../../core';

export interface UsePreferenceResult {
  /** `undefined` until the stored value is loaded, `null` when no value is stored. */
  value: string | null | undefined;
  set: (value: string) => Promise<void>;
  remove: () => Promise<void>;
}

/** Plugin methods plus `isPluginAvailable`. */
export const usePreferences = createMethodsHook('Preferences', Preferences, [
  'configure',
  'get',
  'set',
  'remove',
  'clear',
  'keys',
  'migrate',
  'removeOld',
]);

/**
 * The stored value for `key`, loaded on mount and shared by every component
 * using the same key. `value` is `undefined` while loading and `null` when the
 * key is not set.
 *
 * The plugin emits no change event: only writes made through the returned `set`
 * and `remove` update the mounted hooks. Writes made directly through the
 * `Preferences` plugin bypass this notification.
 */
export function usePreference(key: string): UsePreferenceResult {
  const store = useMemo(() => getStore(key), [key]);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const set = useCallback(
    async (nextValue: string) => {
      await Preferences.set({ key, value: nextValue });
      notify(key, nextValue);
    },
    [key],
  );
  const remove = useCallback(async () => {
    await Preferences.remove({ key });
    notify(key, null);
  }, [key]);
  return useMemo(() => ({ value, set, remove }), [value, set, remove]);
}

type PreferenceValue = string | null;
type PreferenceEmit = (value: PreferenceValue) => void;

const storesByKey = new Map<string, SharedStore<PreferenceValue>>();
const emittersByKey = new Map<string, Set<PreferenceEmit>>();

function getStore(key: string): SharedStore<PreferenceValue> {
  const existingStore = storesByKey.get(key);
  if (existingStore) {
    return existingStore;
  }
  const store = createSharedStore<PreferenceValue>({
    load: () => Preferences.get({ key }).then(result => result.value),
    subscribe: emit => {
      const emitters = emittersByKey.get(key) ?? new Set<PreferenceEmit>();
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

function notify(key: string, value: PreferenceValue): void {
  emittersByKey.get(key)?.forEach(emit => emit(value));
}
