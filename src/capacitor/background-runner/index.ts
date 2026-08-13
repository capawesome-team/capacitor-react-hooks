import type { NotificationActionEvent } from '@capacitor/background-runner';
import { BackgroundRunner } from '@capacitor/background-runner';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The runner JavaScript executes outside the webview in its own context, so
 * this hook only covers the bridge surface: dispatching events to the runner
 * and the permissions the runner APIs require.
 */
export const useBackgroundRunner = createMethodsHook(
  'CapacitorBackgroundRunner',
  BackgroundRunner,
  ['dispatchEvent', 'checkPermissions', 'requestPermissions'],
);

/**
 * Permission status of the device APIs available to the runner, with
 * imperative `check` and `request`.
 *
 * The permissions are granted to the app, not to the runner code, which
 * executes outside the webview.
 */
export const useBackgroundRunnerPermissions = createPermissionsHook(BackgroundRunner);

/** Invokes `callback` when a notification created by the runner is acted on. */
export function useBackgroundRunnerNotificationReceived(
  callback: (event: NotificationActionEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BackgroundRunner, 'backgroundRunnerNotificationReceived', callback, options);
}
