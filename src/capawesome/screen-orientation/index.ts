import type {
  OrientationType,
  ScreenOrientationChange,
} from '@capawesome/capacitor-screen-orientation';
import { ScreenOrientation } from '@capawesome/capacitor-screen-orientation';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useScreenOrientation = createMethodsHook('ScreenOrientation', ScreenOrientation, [
  'lock',
  'unlock',
  'getCurrentOrientation',
]);

/**
 * The current screen orientation type, kept in sync via a single shared plugin
 * listener. `undefined` until the initial orientation resolves.
 */
export const useScreenOrientationType = createPluginStateHook<OrientationType>({
  load: () => ScreenOrientation.getCurrentOrientation().then(({ type }) => type),
  subscribe: emit =>
    pluginEventSubscription<ScreenOrientationChange>(
      ScreenOrientation,
      'screenOrientationChange',
    )(change => emit(change.type)),
});

/** Invokes `callback` whenever the screen orientation changes. */
export function useScreenOrientationChange(
  callback: (change: ScreenOrientationChange) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ScreenOrientation, 'screenOrientationChange', callback, options);
}
