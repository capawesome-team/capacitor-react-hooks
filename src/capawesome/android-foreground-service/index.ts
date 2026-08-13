import type {
  ButtonClickedEvent,
  NotificationTappedEvent,
} from '@capawesome-team/capacitor-android-foreground-service';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useForegroundService = createMethodsHook('ForegroundService', ForegroundService, [
  'moveToForeground',
  'startForegroundService',
  'updateForegroundService',
  'stopForegroundService',
  'checkPermissions',
  'requestPermissions',
  'checkManageOverlayPermission',
  'requestManageOverlayPermission',
  'createNotificationChannel',
  'deleteNotificationChannel',
]);

/**
 * Notification permission status with imperative `check` and `request`.
 *
 * The overlay permission needed by `moveToForeground()` is not covered here:
 * use `checkManageOverlayPermission()` and `requestManageOverlayPermission()`
 * from `useForegroundService()` instead.
 *
 * Only available on Android.
 */
export const useForegroundServicePermissions = createPermissionsHook(ForegroundService);

/** Invokes `callback` when a notification button is clicked. Only available on iOS. */
export function useButtonClicked(
  callback: (event: ButtonClickedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ForegroundService, 'buttonClicked', callback, options);
}

/**
 * Invokes `callback` when the foreground service notification is tapped.
 * Only available on Android.
 */
export function useNotificationTapped(
  callback: (event: NotificationTappedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ForegroundService, 'notificationTapped', callback, options);
}
