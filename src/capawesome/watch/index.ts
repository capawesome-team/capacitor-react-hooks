import type {
  GetConnectionInfoResult,
  MessageReceivedEvent,
  ReachabilityChangeEvent,
  StateReceivedEvent,
  UserInfoReceivedEvent,
} from '@capawesome-team/capacitor-watch';
import { Watch } from '@capawesome-team/capacitor-watch';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS.
 */
export const useWatch = createMethodsHook('Watch', Watch, [
  'getConnectionInfo',
  'getReceivedState',
  'replyToMessage',
  'sendMessage',
  'transferUserInfo',
  'updateState',
]);

const subscribeToReachabilityChange = pluginEventSubscription<ReachabilityChangeEvent>(
  Watch,
  'reachabilityChange',
);
const subscribeToStateReceived = pluginEventSubscription<StateReceivedEvent>(
  Watch,
  'stateReceived',
);

/**
 * The current connection to the watch, reloaded via a single shared listener
 * whenever the reachability changes. `undefined` until the initial information
 * resolves.
 *
 * Only available on Android and iOS.
 */
export const useWatchConnectionInfo = createPluginStateHook<GetConnectionInfoResult>({
  load: () => Watch.getConnectionInfo(),
  subscribe: emit =>
    subscribeToReachabilityChange(() => {
      Watch.getConnectionInfo().then(emit, discardError);
    }),
});

/**
 * The last state that was received from the watch, kept in sync via a single
 * shared plugin listener. `null` while no state has been received yet and
 * `undefined` until the persisted state resolves.
 *
 * Only available on Android and iOS.
 */
export const useWatchReceivedState = createPluginStateHook<Record<string, unknown> | null>({
  load: async () => (await Watch.getReceivedState()).data,
  subscribe: emit => subscribeToStateReceived(event => emit(event.data)),
});

/**
 * Invokes `callback` whenever a message from the watch is received. Reply to
 * messages that carry a `messageId` with `replyToMessage`.
 *
 * Only available on Android and iOS.
 */
export function useWatchMessageReceived(
  callback: (event: MessageReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Watch, 'messageReceived', callback, options);
}

/**
 * Invokes `callback` whenever the reachability of the watch changes.
 *
 * Only available on Android and iOS.
 */
export function useWatchReachabilityChange(
  callback: (event: ReachabilityChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Watch, 'reachabilityChange', callback, options);
}

/**
 * Invokes `callback` whenever a state update from the watch is received.
 *
 * Only available on Android and iOS.
 */
export function useWatchStateReceived(
  callback: (event: StateReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Watch, 'stateReceived', callback, options);
}

/**
 * Invokes `callback` whenever a user info transfer from the watch is received.
 *
 * Only available on Android and iOS.
 */
export function useWatchUserInfoReceived(
  callback: (event: UserInfoReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Watch, 'userInfoReceived', callback, options);
}
