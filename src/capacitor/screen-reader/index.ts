import type { ScreenReaderState } from '@capacitor/screen-reader';
import { ScreenReader } from '@capacitor/screen-reader';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useScreenReader = createMethodsHook('ScreenReader', ScreenReader, [
  'isEnabled',
  'speak',
]);

/**
 * Whether a screen reader is currently active, kept in sync via a single shared
 * plugin listener. `undefined` until the initial state resolves.
 *
 * Screen readers cannot be detected on web, so the state stays `undefined`
 * there.
 */
export const useScreenReaderEnabled = createPluginStateHook<boolean>({
  load: () => ScreenReader.isEnabled().then(({ value }) => value),
  subscribe: emit =>
    pluginEventSubscription<ScreenReaderState>(
      ScreenReader,
      'stateChange',
    )(state => emit(state.value)),
});

/** Invokes `callback` whenever the screen reader is turned on or off. */
export function useScreenReaderStateChange(
  callback: (state: ScreenReaderState) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ScreenReader, 'stateChange', callback, options);
}
