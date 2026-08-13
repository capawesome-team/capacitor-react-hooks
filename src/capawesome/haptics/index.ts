import { Haptics } from '@capawesome/capacitor-haptics';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `performAndroidHaptic` is only available on Android.
 */
export const useHaptics = createMethodsHook('Haptics', Haptics, [
  'impact',
  'isAvailable',
  'notification',
  'performAndroidHaptic',
  'playPattern',
  'selectionStart',
  'selectionChanged',
  'selectionEnd',
  'vibrate',
]);
