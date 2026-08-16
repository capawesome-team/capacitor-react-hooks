import type { Network, NetworksScannedEvent } from '@capawesome-team/capacitor-wifi';
import { Wifi } from '@capawesome-team/capacitor-wifi';

import {
  createMethodsHook,
  createPermissionsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS.
 */
export const useWifi = createMethodsHook('Wifi', Wifi, [
  'addNetwork',
  'connect',
  'disconnect',
  'getAvailableNetworks',
  'getIpAddress',
  'getRssi',
  'getSsid',
  'isEnabled',
  'startScan',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * The location permission status, checked on mount.
 *
 * Only available on Android and iOS.
 */
export const useWifiPermissions = createPermissionsHook(Wifi);

const subscribeToNetworksScanned = pluginEventSubscription<NetworksScannedEvent>(
  Wifi,
  'networksScanned',
);

/**
 * The Wi-Fi networks found during the last scan, kept in sync via a single
 * shared plugin listener. `undefined` until the initial networks resolve.
 *
 * Scans are not started automatically. Trigger one with `startScan` from
 * `useWifi`.
 *
 * Only available on Android.
 */
export const useWifiAvailableNetworks = createPluginStateHook<Network[]>({
  load: async () => (await Wifi.getAvailableNetworks()).networks,
  subscribe: emit => subscribeToNetworksScanned(event => emit(event.networks)),
});

/**
 * Invokes `callback` whenever the results of a Wi-Fi scan are available.
 *
 * Only available on Android.
 */
export function useWifiNetworksScanned(
  callback: (event: NetworksScannedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Wifi, 'networksScanned', callback, options);
}
