import { PrivacyScreen } from '@capacitor/privacy-screen';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const usePrivacyScreen = createMethodsHook('PrivacyScreen', PrivacyScreen, [
  'enable',
  'disable',
  'isEnabled',
]);
