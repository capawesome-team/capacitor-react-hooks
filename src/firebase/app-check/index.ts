import type { TokenChangedEvent } from '@capacitor-firebase/app-check';
import { FirebaseAppCheck } from '@capacitor-firebase/app-check';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` activates App Check and can only be called once per app.
 */
export const useFirebaseAppCheck = createMethodsHook('FirebaseAppCheck', FirebaseAppCheck, [
  'getToken',
  'initialize',
  'setTokenAutoRefreshEnabled',
]);

/**
 * Invokes `callback` whenever the App Check token changes.
 *
 * The event only carries the token itself. Use `getToken` if the expiration
 * time is needed as well.
 */
export function useAppCheckTokenChanged(
  callback: (event: TokenChangedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAppCheck, 'tokenChanged', callback, options);
}
