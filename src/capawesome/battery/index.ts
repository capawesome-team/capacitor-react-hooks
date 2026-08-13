import type {
  BatteryLevelChangeEvent,
  BatteryState,
  BatteryStateChangeEvent,
  LowPowerModeChangeEvent,
} from '@capawesome/capacitor-battery';
import { Battery } from '@capawesome/capacitor-battery';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useBattery = createMethodsHook('Battery', Battery, [
  'getBatteryLevel',
  'getBatteryState',
  'isLowPowerModeEnabled',
]);

/**
 * The current battery level as a value between `0.0` and `1.0`, kept in sync
 * via a single shared plugin listener. `undefined` until the initial level
 * resolves.
 *
 * On the web, only supported in browsers that implement the Battery Status API.
 */
export const useBatteryLevel = createPluginStateHook<number>({
  load: async () => (await Battery.getBatteryLevel()).level,
  subscribe: emit =>
    pluginEventSubscription<BatteryLevelChangeEvent>(
      Battery,
      'batteryLevelChange',
    )(({ level }) => emit(level)),
});

/**
 * The current battery state, kept in sync via a single shared plugin listener.
 * `undefined` until the initial state resolves.
 *
 * On the web, only supported in browsers that implement the Battery Status API.
 */
export const useBatteryState = createPluginStateHook<BatteryState>({
  load: async () => (await Battery.getBatteryState()).state,
  subscribe: emit =>
    pluginEventSubscription<BatteryStateChangeEvent>(
      Battery,
      'batteryStateChange',
    )(({ state }) => emit(state)),
});

/**
 * Whether the low power mode is currently enabled, kept in sync via a single
 * shared plugin listener. `undefined` until the initial value resolves.
 *
 * Only available on Android and iOS.
 */
export const useIsLowPowerModeEnabled = createPluginStateHook<boolean>({
  load: async () => (await Battery.isLowPowerModeEnabled()).enabled,
  subscribe: emit =>
    pluginEventSubscription<LowPowerModeChangeEvent>(
      Battery,
      'lowPowerModeChange',
    )(({ enabled }) => emit(enabled)),
});

/**
 * Invokes `callback` whenever the battery level changes.
 *
 * On the web, only supported in browsers that implement the Battery Status API.
 */
export function useBatteryLevelChange(
  callback: (event: BatteryLevelChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Battery, 'batteryLevelChange', callback, options);
}

/**
 * Invokes `callback` whenever the battery state changes.
 *
 * On the web, only supported in browsers that implement the Battery Status API.
 */
export function useBatteryStateChange(
  callback: (event: BatteryStateChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Battery, 'batteryStateChange', callback, options);
}

/**
 * Invokes `callback` whenever the low power mode is enabled or disabled.
 *
 * Only available on Android and iOS.
 */
export function useLowPowerModeChange(
  callback: (event: LowPowerModeChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Battery, 'lowPowerModeChange', callback, options);
}
