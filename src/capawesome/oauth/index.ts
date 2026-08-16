import { Oauth } from '@capawesome-team/capacitor-oauth';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `login`, `logout` and `refreshToken` reject instead of resolving when the
 * user cancels the flow.
 *
 * `handleRedirectCallback` is only available on Web and must be called on page
 * load while the URL contains the authorization response parameters.
 */
export const useOauth = createMethodsHook('Oauth', Oauth, [
  'decodeIdToken',
  'getAccessTokenExpirationDate',
  'handleRedirectCallback',
  'isAccessTokenAvailable',
  'isAccessTokenExpired',
  'isRefreshTokenAvailable',
  'login',
  'logout',
  'refreshToken',
]);
