import type { BrowserPageNavigationCompletedEventData } from '@capacitor/inappbrowser';
import { InAppBrowser } from '@capacitor/inappbrowser';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useInAppBrowser = createMethodsHook('InAppBrowser', InAppBrowser, [
  'openInWebView',
  'openInSystemBrowser',
  'openInExternalBrowser',
  'close',
]);

/** Invokes `callback` when the browser is closed. */
export function useInAppBrowserClosed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(InAppBrowser, 'browserClosed', callback, options);
}

/** Invokes `callback` when the page opened in the browser has finished loading. */
export function useInAppBrowserPageLoaded(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(InAppBrowser, 'browserPageLoaded', callback, options);
}

/**
 * Invokes `callback` when a navigation inside the browser has completed.
 * Only fired for browsers opened with `openInWebView`.
 */
export function useInAppBrowserPageNavigationCompleted(
  callback: (data: BrowserPageNavigationCompletedEventData) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(InAppBrowser, 'browserPageNavigationCompleted', callback, options);
}
