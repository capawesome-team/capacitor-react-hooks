import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useEdgeToEdge = createMethodsHook('EdgeToEdge', EdgeToEdge, [
  'enable',
  'disable',
  'getInsets',
  'setStatusBarColor',
  'setNavigationBarColor',
]);
