import type { ClickEvent } from '@capawesome/capacitor-app-shortcuts';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useAppShortcuts = createMethodsHook('AppShortcuts', AppShortcuts, [
  'get',
  'set',
  'clear',
]);

/**
 * Invokes `callback` when an app shortcut is clicked. Only available on
 * Android and iOS.
 *
 * A click can launch the app, in which case the event fires before React has
 * mounted. Combine this hook with `captureLaunchEvents` to receive those
 * events as well.
 */
export function useAppShortcutClick(
  callback: (event: ClickEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AppShortcuts, 'click', callback, options);
}
