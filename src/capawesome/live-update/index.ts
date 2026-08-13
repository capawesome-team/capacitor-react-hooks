import type {
  DownloadBundleProgressEvent,
  NextBundleSetEvent,
} from '@capawesome/capacitor-live-update';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

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
export const useLiveUpdate = createMethodsHook('LiveUpdate', LiveUpdate, [
  'clearBlockedBundles',
  'deleteBundle',
  'downloadBundle',
  'fetchChannels',
  'fetchLatestBundle',
  'getBlockedBundles',
  'getChannel',
  'getConfig',
  'getCurrentBundle',
  'getCustomId',
  'getDeviceId',
  'getDownloadedBundles',
  'getNextBundle',
  'getVersionCode',
  'getVersionName',
  'isSyncing',
  'ready',
  'reload',
  'reset',
  'resetConfig',
  'setChannel',
  'setConfig',
  'setCustomId',
  'setNextBundle',
  'sync',
]);

const subscribeToNextBundleSet = pluginEventSubscription<NextBundleSetEvent>(
  LiveUpdate,
  'nextBundleSet',
);

/**
 * The identifier of the bundle that is used after the next reload, kept in sync
 * via a single shared plugin listener. `null` while the default bundle is used
 * and `undefined` until the initial value resolves.
 *
 * Only available on Android and iOS.
 */
export const useLiveUpdateNextBundle = createPluginStateHook<string | null>({
  load: async () => (await LiveUpdate.getNextBundle()).bundleId,
  subscribe: emit => subscribeToNextBundleSet(event => emit(event.bundleId)),
});

/**
 * Invokes `callback` whenever the download progress of a bundle changes.
 *
 * Only available on Android and iOS.
 */
export function useLiveUpdateDownloadBundleProgress(
  callback: (event: DownloadBundleProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(LiveUpdate, 'downloadBundleProgress', callback, options);
}

/**
 * Invokes `callback` whenever a bundle is set as the next bundle, either by an
 * automatic update or by `setNextBundle`.
 *
 * Only available on Android and iOS.
 */
export function useLiveUpdateNextBundleSet(
  callback: (event: NextBundleSetEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(LiveUpdate, 'nextBundleSet', callback, options);
}

/**
 * Invokes `callback` after the app has been reloaded by `reload`.
 *
 * Only available on Android and iOS.
 */
export function useLiveUpdateReloaded(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(LiveUpdate, 'reloaded', callback, options);
}
