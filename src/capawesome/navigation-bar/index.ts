import { NavigationBar } from '@capawesome/capacitor-navigation-bar';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useNavigationBar = createMethodsHook('NavigationBar', NavigationBar, [
  'getColor',
  'getStyle',
  'hide',
  'setColor',
  'setStyle',
  'show',
]);
