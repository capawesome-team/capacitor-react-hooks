import { AppIcon } from '@capawesome/capacitor-app-icon';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 */
export const useAppIcon = createMethodsHook('AppIcon', AppIcon, [
  'getCurrentIcon',
  'isAvailable',
  'resetIcon',
  'setIcon',
]);
