import { Biometrics } from '@capawesome-team/capacitor-biometrics';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `authenticate` rejects instead of resolving when the user cancels the prompt
 * or fails to authenticate.
 *
 * `enroll`, `getAuthenticationType` and `getBiometricStrengthLevel` are only
 * available on Android.
 */
export const useBiometrics = createMethodsHook('Biometrics', Biometrics, [
  'authenticate',
  'cancelAuthentication',
  'enroll',
  'getAuthenticationType',
  'getBiometricStrengthLevel',
  'getBiometricType',
  'getBiometricTypes',
  'hasDeviceCredential',
  'isAllowed',
  'isAvailable',
  'isEnrolled',
  'isLockedOut',
]);
