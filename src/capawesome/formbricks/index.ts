import { Formbricks } from '@capawesome/capacitor-formbricks';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `setup` must be called before any other method.
 */
export const useFormbricks = createMethodsHook('Formbricks', Formbricks, [
  'logout',
  'setAttribute',
  'setAttributes',
  'setLanguage',
  'setUserId',
  'setup',
  'track',
]);
