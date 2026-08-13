import { MapsLauncher } from '@capawesome/capacitor-maps-launcher';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS. `getDefaultApp` is only available on
 * Android.
 */
export const useMapsLauncher = createMethodsHook('MapsLauncher', MapsLauncher, [
  'getAvailableApps',
  'getDefaultApp',
  'navigate',
]);
