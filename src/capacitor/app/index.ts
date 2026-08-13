import type {
  AppState,
  BackButtonListenerEvent,
  RestoredListenerEvent,
  URLOpenListenerEvent,
} from '@capacitor/app';
import { App } from '@capacitor/app';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useApp = createMethodsHook('App', App, [
  'exitApp',
  'getInfo',
  'getState',
  'getLaunchUrl',
  'minimizeApp',
  'getAppLanguage',
  'toggleBackButtonHandler',
]);

/**
 * The current app state, kept in sync via a single shared plugin listener.
 * `undefined` until the initial state resolves.
 */
export const useAppState = createPluginStateHook<AppState>({
  load: () => App.getState(),
  subscribe: pluginEventSubscription(App, 'appStateChange'),
});

/** Invokes `callback` whenever the app or activity state changes. */
export function useAppStateChange(
  callback: (state: AppState) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(App, 'appStateChange', callback, options);
}

/** Invokes `callback` when the app or activity is paused. */
export function useAppPause(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(App, 'pause', callback, options);
}

/** Invokes `callback` when the app or activity is resumed. */
export function useAppResume(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(App, 'resume', callback, options);
}

/**
 * Invokes `callback` when the app is opened with a URL, such as a custom URL
 * scheme link, a Universal Link or an App Link.
 *
 * A link can launch the app, in which case the event fires before React has
 * mounted. Combine this hook with `captureLaunchEvents` to receive that event.
 */
export function useAppUrlOpen(
  callback: (event: URLOpenListenerEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(App, 'appUrlOpen', callback, options);
}

/**
 * Invokes `callback` with plugin call results that were delivered while the app
 * was not running, for example a photo taken after Android terminated the app.
 *
 * These results are delivered on launch, before React has mounted. Combine this
 * hook with `captureLaunchEvents` to receive them.
 */
export function useAppRestoredResult(
  callback: (event: RestoredListenerEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(App, 'appRestoredResult', callback, options);
}

/**
 * Invokes `callback` when the hardware back button is pressed (Android only).
 * Listening disables the default back button behaviour, so navigate with
 * `window.history.back()` or exit the app with `App.exitApp()` yourself.
 */
export function useBackButton(
  callback: (event: BackButtonListenerEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(App, 'backButton', callback, options);
}
