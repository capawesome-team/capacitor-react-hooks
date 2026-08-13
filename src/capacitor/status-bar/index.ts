import type { StatusBarInfo } from '@capacitor/status-bar';
import { StatusBar } from '@capacitor/status-bar';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isAvailable`. The plugin has no web implementation:
 * check `isAvailable` before calling any method.
 */
export const useStatusBar = createMethodsHook('StatusBar', StatusBar, [
  'setStyle',
  'setBackgroundColor',
  'show',
  'hide',
  'getInfo',
  'setOverlaysWebView',
]);

/**
 * Invokes `callback` when the status bar is shown or hidden.
 *
 * The event only fires in response to your own `show` and `hide` calls, not to
 * visibility changes made by the system.
 */
export function useStatusBarVisibilityChanged(
  callback: (info: StatusBarInfo) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(StatusBar, 'statusBarVisibilityChanged', callback, options);
}

/**
 * Invokes `callback` when the status bar overlay changes.
 *
 * The event only fires in response to your own `setOverlaysWebView` calls, not
 * to overlay changes made by the system.
 */
export function useStatusBarOverlayChanged(
  callback: (info: StatusBarInfo) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(StatusBar, 'statusBarOverlayChanged', callback, options);
}
