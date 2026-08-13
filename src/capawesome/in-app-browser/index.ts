import type {
  BrowserMessageReceivedEvent,
  BrowserNavigationCompletedEvent,
  BrowserUrlChangedEvent,
} from '@capawesome/capacitor-in-app-browser';
import { InAppBrowser } from '@capawesome/capacitor-in-app-browser';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useInAppBrowser = createMethodsHook('InAppBrowser', InAppBrowser, [
  'clearCache',
  'clearCookies',
  'close',
  'executeScript',
  'getCookies',
  'openInExternalBrowser',
  'openInSystemBrowser',
  'openInWebView',
  'postMessage',
  'show',
]);

/** Invokes `callback` when the browser is closed. */
export function useInAppBrowserClosed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(InAppBrowser, 'browserClosed', callback, options);
}

/**
 * Invokes `callback` when the web page posts a message to the app.
 * Only fired for browsers opened with `openInWebView`.
 */
export function useInAppBrowserMessageReceived(
  callback: (event: BrowserMessageReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(InAppBrowser, 'browserMessageReceived', callback, options);
}

/**
 * Invokes `callback` when a page navigation in the web view has completed.
 * Only fired for browsers opened with `openInWebView`.
 */
export function useInAppBrowserNavigationCompleted(
  callback: (event: BrowserNavigationCompletedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(InAppBrowser, 'browserNavigationCompleted', callback, options);
}

/** Invokes `callback` when the initial page of the browser has finished loading. */
export function useInAppBrowserPageLoaded(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(InAppBrowser, 'browserPageLoaded', callback, options);
}

/**
 * Invokes `callback` whenever the current URL of the web view changes, including
 * the initial URL. Fires earlier than `useInAppBrowserNavigationCompleted` and
 * only for browsers opened with `openInWebView`.
 */
export function useInAppBrowserUrlChanged(
  callback: (event: BrowserUrlChangedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(InAppBrowser, 'browserUrlChanged', callback, options);
}
