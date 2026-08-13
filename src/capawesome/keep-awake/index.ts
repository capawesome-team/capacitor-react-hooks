import { KeepAwake } from '@capawesome/capacitor-keep-awake';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useKeepAwake = createMethodsHook('KeepAwake', KeepAwake, [
  'keepAwake',
  'allowSleep',
  'isAvailable',
  'isKeptAwake',
]);
