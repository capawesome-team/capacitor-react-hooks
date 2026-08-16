import type {
  ApnsTokenReceivedEvent,
  GetTokenOptions,
  NotificationActionPerformedEvent,
  NotificationReceivedEvent,
  TokenReceivedEvent,
} from '@capacitor-firebase/messaging';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { useCallback, useMemo, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  toError,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

export interface UseFirebaseMessagingTokenResult {
  /** The FCM token; `undefined` until a token is received or requested. */
  token: string | undefined;
  error: Error | undefined;
  /**
   * Requests the FCM token, re-enables FCM auto-init and resolves the token, or
   * `undefined` if the request failed. The failure is exposed as `error`.
   */
  getToken: (options?: GetTokenOptions) => Promise<string | undefined>;
}

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `subscribeToTopic` and `unsubscribeFromTopic` are only available for Android
 * and iOS, the channel methods only for Android (SDK 26+).
 */
export const useFirebaseMessaging = createMethodsHook('FirebaseMessaging', FirebaseMessaging, [
  'checkPermissions',
  'createChannel',
  'deleteChannel',
  'deleteToken',
  'getDeliveredNotifications',
  'getToken',
  'isSupported',
  'listChannels',
  'removeAllDeliveredNotifications',
  'removeDeliveredNotifications',
  'requestPermissions',
  'subscribeToTopic',
  'unsubscribeFromTopic',
]);

/** Push notification permission status with imperative `check` and `request`. */
export const useFirebaseMessagingPermissions = createPermissionsHook(FirebaseMessaging);

/**
 * The FCM token of the device. The `tokenReceived` listener is attached on
 * mount, so no token is missed while `getToken` is in flight.
 *
 * `getToken` requires the notification permission to be granted: request it
 * first with `useFirebaseMessagingPermissions`. On Web the token is only
 * delivered by `getToken`, because `tokenReceived` is not fired there.
 */
export function useFirebaseMessagingToken(): UseFirebaseMessagingTokenResult {
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<Error>();
  const mountedRef = useMountedRef();
  usePluginListener<TokenReceivedEvent>(FirebaseMessaging, 'tokenReceived', event => {
    setToken(event.token);
    setError(undefined);
  });
  const getToken = useCallback(
    async (options?: GetTokenOptions) => {
      try {
        const result = await FirebaseMessaging.getToken(options);
        if (mountedRef.current) {
          setToken(result.token);
          setError(undefined);
        }
        return result.token;
      } catch (caught) {
        if (mountedRef.current) {
          setError(toError(caught));
        }
        return undefined;
      }
    },
    [mountedRef],
  );
  return useMemo(() => ({ token, error, getToken }), [token, error, getToken]);
}

/**
 * Invokes `callback` when a new FCM token is received.
 *
 * Only available for Android and iOS.
 */
export function useFirebaseMessagingTokenReceived(
  callback: (event: TokenReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseMessaging, 'tokenReceived', callback, options);
}

/**
 * Invokes `callback` when the APNs token is received.
 *
 * Only available for iOS.
 */
export function useFirebaseMessagingApnsTokenReceived(
  callback: (event: ApnsTokenReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseMessaging, 'apnsTokenReceived', callback, options);
}

/**
 * Invokes `callback` when a new push notification is received.
 *
 * The notification is only delivered while the app is in the foreground, except
 * for data push notifications on Android and silent push notifications on iOS.
 */
export function useFirebaseMessagingNotificationReceived(
  callback: (event: NotificationReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseMessaging, 'notificationReceived', callback, options);
}

/**
 * Invokes `callback` when an action is performed on a push notification.
 *
 * The event can fire before React has mounted, for example when a notification
 * tap launches the app. Combine this hook with `captureLaunchEvents` to receive
 * those events as well.
 *
 * Only available for Android and iOS.
 */
export function useFirebaseMessagingNotificationActionPerformed(
  callback: (event: NotificationActionPerformedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseMessaging, 'notificationActionPerformed', callback, options);
}
