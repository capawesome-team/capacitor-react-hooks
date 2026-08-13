import { Alarm } from '@capawesome/capacitor-alarm';

import { createMethodsHook, createPermissionsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `createTimer` and `openAlarms` are only available on Android, `getAlarms`
 * and `cancelAlarm` only on iOS.
 */
export const useAlarm = createMethodsHook('Alarm', Alarm, [
  'createAlarm',
  'isAvailable',
  'createTimer',
  'getAlarms',
  'cancelAlarm',
  'openAlarms',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Alarm scheduling permission status with imperative `check` and `request`.
 * Only available on Android and iOS; on Android the permission is always
 * granted because alarms are created via the system clock app.
 */
export const useAlarmPermissions = createPermissionsHook(Alarm);
