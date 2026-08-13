import { PasswordAutofill } from '@capawesome/capacitor-password-autofill';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const usePasswordAutofill = createMethodsHook('PasswordAutofill', PasswordAutofill, [
  'savePassword',
]);
