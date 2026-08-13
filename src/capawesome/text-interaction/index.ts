import { TextInteraction } from '@capawesome/capacitor-text-interaction';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on iOS. */
export const useTextInteraction = createMethodsHook('TextInteraction', TextInteraction, [
  'enable',
  'disable',
  'isEnabled',
]);
