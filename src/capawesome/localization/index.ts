import { Localization } from '@capawesome/capacitor-localization';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useLocalization = createMethodsHook('Localization', Localization, [
  'getLocales',
  'getSettings',
]);
