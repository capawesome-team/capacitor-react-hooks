import { DeviceInfo } from '@capawesome/capacitor-device-info';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `getUptime` is only available on Android and iOS.
 */
export const useDeviceInfo = createMethodsHook('DeviceInfo', DeviceInfo, [
  'getId',
  'getInfo',
  'getUptime',
]);
