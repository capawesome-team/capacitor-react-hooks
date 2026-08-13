import { HomeIndicator } from '@capawesome/capacitor-home-indicator';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on iOS.
 *
 * `isHidden` reports the plugin-managed state, not the actual visibility of the
 * home indicator on screen.
 */
export const useHomeIndicator = createMethodsHook('HomeIndicator', HomeIndicator, [
  'hide',
  'show',
  'isHidden',
]);
