import { AppTrackingTransparency } from '@capawesome/capacitor-app-tracking-transparency';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on iOS.
 *
 * `requestPermission()` presents the system tracking authorization prompt,
 * which is only shown once per install. The `NSUserTrackingUsageDescription`
 * key must be added to the `Info.plist` file of the app.
 */
export const useAppTrackingTransparency = createMethodsHook(
  'AppTrackingTransparency',
  AppTrackingTransparency,
  ['getStatus', 'requestPermission', 'getAdvertisingIdentifier'],
);
