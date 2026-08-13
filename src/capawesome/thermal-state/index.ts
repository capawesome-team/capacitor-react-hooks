import type {
  ThermalStateChangeEvent,
  ThermalStateValue,
} from '@capawesome/capacitor-thermal-state';
import { ThermalState } from '@capawesome/capacitor-thermal-state';

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
 * Only available on Android (API level 29+) and iOS.
 */
export const useThermalState = createMethodsHook('ThermalState', ThermalState, ['getThermalState']);

/**
 * The current thermal state of the device, kept in sync via a single shared
 * plugin listener. `undefined` until the initial state resolves.
 *
 * Only available on Android (API level 29+) and iOS.
 */
export const useThermalStateValue = createPluginStateHook<ThermalStateValue>({
  load: async () => (await ThermalState.getThermalState()).state,
  subscribe: emit =>
    pluginEventSubscription<ThermalStateChangeEvent>(
      ThermalState,
      'thermalStateChange',
    )(({ state }) => emit(state)),
});

/**
 * Invokes `callback` whenever the thermal state of the device changes.
 *
 * Only available on Android (API level 29+) and iOS.
 */
export function useThermalStateChange(
  callback: (event: ThermalStateChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ThermalState, 'thermalStateChange', callback, options);
}
