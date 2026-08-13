import { Browser } from '@capacitor/browser';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useBrowser = createMethodsHook('Browser', Browser, ['open', 'close']);

/** Invokes `callback` when the browser is closed by the user. */
export function useBrowserFinished(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Browser, 'browserFinished', callback, options);
}

/**
 * Invokes `callback` when the URL passed to `open` has finished loading.
 * Subsequent page loads do not fire this event.
 */
export function useBrowserPageLoaded(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Browser, 'browserPageLoaded', callback, options);
}
