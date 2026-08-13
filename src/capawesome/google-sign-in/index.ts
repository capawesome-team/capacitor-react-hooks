import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called once before all other methods. On Web, `signIn`
 * redirects to Google and never resolves: complete the flow with
 * `handleRedirectCallback`, which is only available on Web.
 */
export const useGoogleSignIn = createMethodsHook('GoogleSignIn', GoogleSignIn, [
  'handleRedirectCallback',
  'initialize',
  'signIn',
  'signOut',
]);
