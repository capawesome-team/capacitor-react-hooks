import type {
  ActionPerformed,
  PushNotificationSchema,
  RegistrationError,
  Token,
} from '@capacitor/push-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { useCallback, useMemo, useState } from 'react';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

export interface UsePushTokenResult {
  /** Push token; `undefined` until the registration succeeds. */
  token: string | undefined;
  error: Error | undefined;
  register: () => Promise<void>;
}

/** Plugin methods plus `isAvailable`. */
export const usePushNotifications = createMethodsHook('PushNotifications', PushNotifications, [
  'register',
  'unregister',
  'getDeliveredNotifications',
  'removeDeliveredNotifications',
  'removeAllDeliveredNotifications',
  'createChannel',
  'deleteChannel',
  'listChannels',
  'checkPermissions',
  'requestPermissions',
]);

/** Push notification permission status with imperative `check` and `request`. */
export const usePushNotificationsPermissions = createPermissionsHook(PushNotifications);

/**
 * The push token of the device. The registration listeners are attached on
 * mount, so no result is missed when `register` resolves quickly.
 *
 * `register` does not prompt for notification permission: request it first with
 * `usePushNotificationsPermissions`.
 */
export function usePushToken(): UsePushTokenResult {
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<Error>();
  usePluginListener<Token>(PushNotifications, 'registration', ({ value }) => {
    setToken(value);
    setError(undefined);
  });
  usePluginListener<RegistrationError>(PushNotifications, 'registrationError', registrationError =>
    setError(new Error(registrationError.error)),
  );
  const register = useCallback(() => PushNotifications.register(), []);
  return useMemo(() => ({ token, error, register }), [token, error, register]);
}

/** Invokes `callback` when a push notification is received. */
export function usePushNotificationReceived(
  callback: (notification: PushNotificationSchema) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(PushNotifications, 'pushNotificationReceived', callback, options);
}

/** Invokes `callback` when an action is performed on a push notification. */
export function usePushNotificationActionPerformed(
  callback: (action: ActionPerformed) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(PushNotifications, 'pushNotificationActionPerformed', callback, options);
}
