import type { ConnectionStatus } from '@capacitor/network';
import { Network } from '@capacitor/network';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useNetwork = createMethodsHook('Network', Network, ['getStatus']);

/**
 * The current network status, kept in sync via a single shared plugin
 * listener. `undefined` until the initial status resolves.
 */
export const useNetworkStatus = createPluginStateHook<ConnectionStatus>({
  load: () => Network.getStatus(),
  subscribe: pluginEventSubscription(Network, 'networkStatusChange'),
});

/** Invokes `callback` whenever the network status changes. */
export function useNetworkStatusChange(
  callback: (status: ConnectionStatus) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Network, 'networkStatusChange', callback, options);
}
