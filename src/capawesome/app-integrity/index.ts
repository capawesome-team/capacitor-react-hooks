import { AppIntegrity } from '@capawesome/capacitor-app-integrity';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `attestKey`, `generateAssertion` and `generateKey` are only available on
 * iOS. `prepareIntegrityToken` and `requestIntegrityToken` are only available
 * on Android.
 */
export const useAppIntegrity = createMethodsHook('AppIntegrity', AppIntegrity, [
  'attestKey',
  'isAvailable',
  'generateAssertion',
  'generateKey',
  'prepareIntegrityToken',
  'requestIntegrityToken',
]);
