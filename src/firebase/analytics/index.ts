import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `getAppInstanceId`, `resetAnalyticsData` and `setSessionTimeoutDuration` are
 * only available on Android and iOS. `logTransaction` and the
 * `initiateOnDeviceConversionMeasurement*` methods are only available on iOS.
 * `isEnabled` is only available on Web.
 */
export const useFirebaseAnalytics = createMethodsHook('FirebaseAnalytics', FirebaseAnalytics, [
  'getAppInstanceId',
  'initiateOnDeviceConversionMeasurementWithEmailAddress',
  'initiateOnDeviceConversionMeasurementWithHashedEmailAddress',
  'initiateOnDeviceConversionMeasurementWithHashedPhoneNumber',
  'initiateOnDeviceConversionMeasurementWithPhoneNumber',
  'isEnabled',
  'logEvent',
  'logTransaction',
  'resetAnalyticsData',
  'setConsent',
  'setCurrentScreen',
  'setEnabled',
  'setSessionTimeoutDuration',
  'setUserId',
  'setUserProperty',
]);
