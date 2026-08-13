import { AppleSignIn } from '@capawesome/capacitor-apple-sign-in';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called before `signIn` on Android and Web.
 */
export const useAppleSignIn = createMethodsHook('AppleSignIn', AppleSignIn, [
  'initialize',
  'signIn',
]);
