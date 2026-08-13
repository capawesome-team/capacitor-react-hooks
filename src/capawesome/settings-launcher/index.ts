import { SettingsLauncher } from '@capawesome/capacitor-settings-launcher';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS. `openAndroidSettings` is only available on
 * Android and `openNotificationSettings` requires iOS 16 or later.
 */
export const useSettingsLauncher = createMethodsHook('SettingsLauncher', SettingsLauncher, [
  'openAndroidSettings',
  'openAppSettings',
  'openNotificationSettings',
]);
