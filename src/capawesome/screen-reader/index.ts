import type { StateChangeEvent } from '@capawesome/capacitor-screen-reader';
import { ScreenReader } from '@capawesome/capacitor-screen-reader';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `isEnabled` is only available on Android and iOS.
 */
export const useScreenReader = createMethodsHook('ScreenReader', ScreenReader, [
  'announce',
  'isEnabled',
]);

/**
 * Whether a screen reader is currently enabled, kept in sync via a single
 * shared plugin listener. `undefined` until the initial state resolves.
 *
 * Screen readers cannot be detected on the web, so the state stays `undefined`
 * there.
 */
export const useScreenReaderEnabled = createPluginStateHook<boolean>({
  load: () => ScreenReader.isEnabled().then(({ enabled }) => enabled),
  subscribe: emit =>
    pluginEventSubscription<StateChangeEvent>(
      ScreenReader,
      'stateChange',
    )(event => emit(event.enabled)),
});

/**
 * Invokes `callback` whenever a screen reader is turned on or off.
 *
 * Only available on Android and iOS.
 */
export function useScreenReaderStateChange(
  callback: (event: StateChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ScreenReader, 'stateChange', callback, options);
}
