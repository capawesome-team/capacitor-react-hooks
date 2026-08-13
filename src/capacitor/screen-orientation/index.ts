import type { ScreenOrientationResult } from '@capacitor/screen-orientation';
import { ScreenOrientation } from '@capacitor/screen-orientation';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useScreenOrientation = createMethodsHook('ScreenOrientation', ScreenOrientation, [
  'orientation',
  'lock',
  'unlock',
]);

/**
 * The current screen orientation, kept in sync via a single shared plugin
 * listener. `undefined` until the initial orientation resolves.
 */
export const useScreenOrientationType = createPluginStateHook<ScreenOrientationResult>({
  load: () => ScreenOrientation.orientation(),
  subscribe: pluginEventSubscription(ScreenOrientation, 'screenOrientationChange'),
});

/** Invokes `callback` whenever the screen orientation changes. */
export function useScreenOrientationChange(
  callback: (orientation: ScreenOrientationResult) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ScreenOrientation, 'screenOrientationChange', callback, options);
}
