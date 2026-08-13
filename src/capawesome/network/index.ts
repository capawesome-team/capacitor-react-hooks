import type { GetStatusResult } from '@capawesome/capacitor-network';
import { Network } from '@capawesome/capacitor-network';

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
 * `isAirplaneModeEnabled` is only available on Android.
 */
export const useNetwork = createMethodsHook('Network', Network, [
  'getStatus',
  'isAirplaneModeEnabled',
]);

/**
 * The current network status, kept in sync via a single shared plugin
 * listener. `undefined` until the initial status resolves.
 */
export const useNetworkStatus = createPluginStateHook<GetStatusResult>({
  load: () => Network.getStatus(),
  subscribe: pluginEventSubscription(Network, 'networkStatusChange'),
});

/** Invokes `callback` whenever the network status changes. */
export function useNetworkStatusChange(
  callback: (status: GetStatusResult) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Network, 'networkStatusChange', callback, options);
}
