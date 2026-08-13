import { DatetimePicker } from '@capawesome-team/capacitor-datetime-picker';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `present` rejects instead of resolving when the user cancels or dismisses the
 * picker.
 */
export const useDatetimePicker = createMethodsHook('DatetimePicker', DatetimePicker, [
  'present',
  'cancel',
]);
