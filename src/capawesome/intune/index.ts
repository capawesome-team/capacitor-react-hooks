import type {
  AppConfigChangeEvent,
  EnrollmentChangeEvent,
  PolicyChangeEvent,
  WipeRequestedEvent,
} from '@capawesome/capacitor-intune';
import { Intune } from '@capawesome/capacitor-intune';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * All methods are only available on Android and iOS, except
 * `loginAndEnrollAccount` which is only available on iOS.
 */
export const useIntune = createMethodsHook('Intune', Intune, [
  'acquireToken',
  'acquireTokenSilent',
  'getAppConfig',
  'getEnrolledAccount',
  'getPolicy',
  'getSdkVersion',
  'loginAndEnrollAccount',
  'registerAndEnrollAccount',
  'showDiagnosticConsole',
  'unenrollAccount',
]);

/**
 * Invokes `callback` when the application configuration changes.
 * Only available on Android and iOS.
 */
export function useIntuneAppConfigChange(
  callback: (event: AppConfigChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Intune, 'appConfigChange', callback, options);
}

/**
 * Invokes `callback` when the enrollment state of an account changes, for
 * example when an enrollment attempt succeeds or fails.
 * Only available on Android and iOS.
 */
export function useIntuneEnrollmentChange(
  callback: (event: EnrollmentChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Intune, 'enrollmentChange', callback, options);
}

/**
 * Invokes `callback` when the app protection policy changes.
 * Only available on Android and iOS.
 */
export function useIntunePolicyChange(
  callback: (event: PolicyChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Intune, 'policyChange', callback, options);
}

/**
 * Invokes `callback` when the Intune service requests a selective wipe of the
 * account's data.
 * Only available on Android and iOS.
 */
export function useIntuneWipeRequested(
  callback: (event: WipeRequestedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Intune, 'wipeRequested', callback, options);
}
