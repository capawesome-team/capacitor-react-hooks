import { InstallReferrer } from '@capawesome/capacitor-install-referrer';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `getAttributionToken` is only available on iOS, `getInstallReferrer` only on
 * Android.
 */
export const useInstallReferrer = createMethodsHook('InstallReferrer', InstallReferrer, [
  'getAttributionToken',
  'getInstallReferrer',
]);
