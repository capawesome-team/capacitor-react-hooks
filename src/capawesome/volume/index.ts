import type {
  VolumeButtonPressedEvent,
  VolumeButtonReleasedEvent,
  VolumeChangeEvent,
} from '@capawesome/capacitor-volume';
import { Volume } from '@capawesome/capacitor-volume';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useVolume = createMethodsHook('Volume', Volume, [
  'getVolume',
  'isWatching',
  'setVolume',
  'startWatching',
  'stopWatching',
]);

/**
 * The current volume level as a value between `0` and `1`, kept in sync via a
 * single shared plugin listener. `undefined` until the initial level resolves.
 *
 * Volume changes are only emitted while the hardware volume buttons are being
 * watched (`startWatching`). On Android, the level refers to the music stream.
 *
 * Only available on Android and iOS.
 */
export const useVolumeLevel = createPluginStateHook<number>({
  load: async () => (await Volume.getVolume()).volume,
  subscribe: emit =>
    pluginEventSubscription<VolumeChangeEvent>(
      Volume,
      'volumeChange',
    )(({ volume }) => emit(volume)),
});

/**
 * Invokes `callback` whenever the volume level changes while the hardware
 * volume buttons are being watched (`startWatching`).
 *
 * Only available on Android and iOS.
 */
export function useVolumeChange(
  callback: (event: VolumeChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Volume, 'volumeChange', callback, options);
}

/**
 * Invokes `callback` whenever a hardware volume button is pressed while the
 * hardware volume buttons are being watched (`startWatching`).
 *
 * Only available on Android and iOS.
 */
export function useVolumeButtonPressed(
  callback: (event: VolumeButtonPressedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Volume, 'volumeButtonPressed', callback, options);
}

/**
 * Invokes `callback` whenever a hardware volume button is released while the
 * hardware volume buttons are being watched (`startWatching`).
 *
 * Only available on Android.
 */
export function useVolumeButtonReleased(
  callback: (event: VolumeButtonReleasedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Volume, 'volumeButtonReleased', callback, options);
}
