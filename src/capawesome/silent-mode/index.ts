import type { SilentModeChangeEvent } from '@capawesome/capacitor-silent-mode';
import { SilentMode } from '@capawesome/capacitor-silent-mode';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. `getRingerMode` is only available on
 * Android.
 */
export const useSilentMode = createMethodsHook('SilentMode', SilentMode, [
  'getRingerMode',
  'isSilent',
]);

/**
 * Whether the device is currently in silent mode, kept in sync via a single
 * shared plugin listener. `undefined` until the initial value resolves.
 *
 * On iOS, the state is determined heuristically and polled while the app is in
 * the foreground, so it may be inaccurate while other audio is playing.
 *
 * Only available on Android and iOS.
 */
export const useIsSilent = createPluginStateHook<boolean>({
  load: async () => (await SilentMode.isSilent()).silent,
  subscribe: emit =>
    pluginEventSubscription<SilentModeChangeEvent>(
      SilentMode,
      'silentModeChange',
    )(({ silent }) => emit(silent)),
});

/**
 * Invokes `callback` whenever the silent mode state of the device changes.
 *
 * On iOS, the state is polled while the app is in the foreground and `callback`
 * is not invoked while the app is in the background.
 *
 * Only available on Android and iOS.
 */
export function useSilentModeChange(
  callback: (event: SilentModeChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SilentMode, 'silentModeChange', callback, options);
}
