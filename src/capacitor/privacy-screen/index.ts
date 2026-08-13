import { PrivacyScreen } from '@capacitor/privacy-screen';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const usePrivacyScreen = createMethodsHook('PrivacyScreen', PrivacyScreen, [
  'enable',
  'disable',
  'isEnabled',
]);
