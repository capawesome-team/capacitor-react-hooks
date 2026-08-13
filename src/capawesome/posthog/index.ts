import { Posthog } from '@capawesome/capacitor-posthog';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `setup` must be called before any other method.
 *
 * `flush` and `screen` are only available on Android and iOS.
 */
export const usePosthog = createMethodsHook('Posthog', Posthog, [
  'alias',
  'capture',
  'captureException',
  'flush',
  'getDistinctId',
  'getFeatureFlag',
  'getFeatureFlagPayload',
  'group',
  'identify',
  'isFeatureEnabled',
  'isOptOut',
  'optIn',
  'optOut',
  'register',
  'reloadFeatureFlags',
  'reset',
  'screen',
  'setup',
  'startSessionRecording',
  'stopSessionRecording',
  'unregister',
]);
