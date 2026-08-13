import { AppLauncher } from '@capawesome/capacitor-app-launcher';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * On Android and iOS, every URL scheme passed to `canOpenUrl(...)` must be
 * declared by the app beforehand, otherwise the check always resolves to
 * `false`.
 */
export const useAppLauncher = createMethodsHook('AppLauncher', AppLauncher, [
  'canOpenUrl',
  'openUrl',
]);
