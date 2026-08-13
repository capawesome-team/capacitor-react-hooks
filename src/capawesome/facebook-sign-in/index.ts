import { FacebookSignIn } from '@capawesome/capacitor-facebook-sign-in';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called once before all other methods. Its `appId`
 * option is required on Web.
 */
export const useFacebookSignIn = createMethodsHook('FacebookSignIn', FacebookSignIn, [
  'getCurrentAccessToken',
  'initialize',
  'signIn',
  'signOut',
]);
