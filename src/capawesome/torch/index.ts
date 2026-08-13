import { Torch } from '@capawesome/capacitor-torch';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useTorch = createMethodsHook('Torch', Torch, [
  'enable',
  'disable',
  'isAvailable',
  'isEnabled',
  'toggle',
]);
