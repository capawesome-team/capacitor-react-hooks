import { Health } from '@capawesome-team/capacitor-health';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `checkPermissions` and `requestPermissions` take the data types to check or
 * request, so they are used imperatively instead of through a permissions hook.
 *
 * Only available on Android and iOS. `installHealthConnect` is only available
 * on Android.
 */
export const useHealth = createMethodsHook('Health', Health, [
  'aggregate',
  'installHealthConnect',
  'isAvailable',
  'openSettings',
  'readRecords',
  'readWorkouts',
  'writeRecord',
  'checkPermissions',
  'requestPermissions',
]);
