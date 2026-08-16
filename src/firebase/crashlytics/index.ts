import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS. Every method rejects on Web.
 * `isEnabled` is only available on iOS.
 */
export const useFirebaseCrashlytics = createMethodsHook(
  'FirebaseCrashlytics',
  FirebaseCrashlytics,
  [
    'crash',
    'deleteUnsentReports',
    'didCrashOnPreviousExecution',
    'isEnabled',
    'log',
    'recordException',
    'sendUnsentReports',
    'setCustomKey',
    'setEnabled',
    'setUserId',
  ],
);
