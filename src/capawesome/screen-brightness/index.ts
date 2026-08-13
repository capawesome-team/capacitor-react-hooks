import { ScreenBrightness } from '@capawesome/capacitor-screen-brightness';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. `resetBrightness` is only available on
 * Android.
 */
export const useScreenBrightness = createMethodsHook('ScreenBrightness', ScreenBrightness, [
  'getBrightness',
  'resetBrightness',
  'setBrightness',
]);
