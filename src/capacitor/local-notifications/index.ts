import type { ActionPerformed, LocalNotificationSchema } from '@capacitor/local-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useLocalNotifications = createMethodsHook('LocalNotifications', LocalNotifications, [
  'schedule',
  'getPending',
  'registerActionTypes',
  'cancel',
  'getDeliveredNotifications',
  'removeDeliveredNotifications',
  'removeAllDeliveredNotifications',
  'createChannel',
  'deleteChannel',
  'listChannels',
  'checkPermissions',
  'requestPermissions',
  'changeExactNotificationSetting',
  'checkExactNotificationSetting',
]);

/** Local notification permission status with imperative `check` and `request`. */
export const useLocalNotificationsPermissions = createPermissionsHook(LocalNotifications);

/** Invokes `callback` when a local notification is displayed. */
export function useLocalNotificationReceived(
  callback: (notification: LocalNotificationSchema) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(LocalNotifications, 'localNotificationReceived', callback, options);
}

/**
 * Invokes `callback` when an action is performed on a local notification.
 *
 * A tap that launches the app fires this event before React mounts. Combine
 * this hook with `captureLaunchEvents` to receive those events as well.
 */
export function useLocalNotificationActionPerformed(
  callback: (action: ActionPerformed) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(LocalNotifications, 'localNotificationActionPerformed', callback, options);
}
