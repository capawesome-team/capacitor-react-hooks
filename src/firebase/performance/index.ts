import { FirebasePerformance } from '@capacitor-firebase/performance';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `record` is only available on Web.
 */
export const useFirebasePerformance = createMethodsHook(
  'FirebasePerformance',
  FirebasePerformance,
  [
    'getAttribute',
    'getAttributes',
    'getMetric',
    'incrementMetric',
    'isEnabled',
    'putAttribute',
    'putMetric',
    'record',
    'removeAttribute',
    'setEnabled',
    'startTrace',
    'stopTrace',
  ],
);
