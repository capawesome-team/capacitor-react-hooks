import { Shake } from '@capawesome/capacitor-shake';
import { useEffect } from 'react';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useShake = createMethodsHook('Shake', Shake, ['startWatching', 'stopWatching']);

/**
 * Invokes `callback` on every shake gesture. Gestures are only detected while
 * watching: start it with `startWatching` or use `useShakeUpdates`, which does
 * both.
 *
 * Only available on Android and iOS.
 */
export function useShakeDetected(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Shake, 'shake', callback, options);
}

/**
 * Watches for shake gestures for the lifetime of the component: starts watching
 * on mount, invokes `callback` on every shake gesture and stops watching on
 * unmount.
 *
 * Watching uses the default sensitivity. To use a different one, call
 * `startWatching` from `useShake` and listen with `useShakeDetected`.
 *
 * Only available on Android and iOS.
 */
export function useShakeUpdates(callback: () => void, options?: ListenerOptions): void {
  const enabled = options?.enabled ?? true;
  useShakeDetected(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Shake.startWatching().catch(discardError);
    return () => {
      void Shake.stopWatching().catch(discardError);
    };
  }, [enabled]);
}
