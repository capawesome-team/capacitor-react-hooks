import type { MessageEvent as NodejsMessageEvent } from '@capawesome/capacitor-nodejs';
import { Nodejs } from '@capawesome/capacitor-nodejs';

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
 * Only available on Android and iOS.
 */
export const useNodejs = createMethodsHook('Nodejs', Nodejs, ['isReady', 'send', 'start']);

const subscribeToReady = pluginEventSubscription<void>(Nodejs, 'ready');

/**
 * Whether the Node.js runtime is ready to receive messages, kept in sync via a
 * single shared plugin listener. `undefined` until the initial value resolves.
 *
 * Only available on Android and iOS.
 */
export const useNodejsIsReady = createPluginStateHook<boolean>({
  load: async () => (await Nodejs.isReady()).ready,
  subscribe: emit => subscribeToReady(() => emit(true)),
});

/**
 * Invokes `callback` whenever a message is received from the Node.js runtime.
 *
 * Only available on Android and iOS.
 */
export function useNodejsMessage(
  callback: (event: NodejsMessageEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Nodejs, 'message', callback, options);
}

/**
 * Invokes `callback` when the Node.js runtime becomes ready to receive messages.
 *
 * Only available on Android and iOS.
 */
export function useNodejsReady(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Nodejs, 'ready', callback, options);
}
