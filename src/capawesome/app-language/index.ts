import { AppLanguage } from '@capawesome/capacitor-app-language';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `setLanguage` and `resetLanguage` are only available on Android. On iOS, the
 * language can only be changed by the user in the system settings, which
 * `openSettings()` opens.
 */
export const useAppLanguage = createMethodsHook('AppLanguage', AppLanguage, [
  'getLanguage',
  'setLanguage',
  'resetLanguage',
  'openSettings',
]);
