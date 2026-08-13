import { RootDetection } from '@capawesome/capacitor-root-detection';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The checks are best-effort and client-side, so they can be bypassed by a
 * determined attacker. Do not rely on them as the sole security measure.
 *
 * Only available on Android and iOS.
 */
export const useRootDetection = createMethodsHook('RootDetection', RootDetection, [
  'isDeveloperModeEnabled',
  'isEmulator',
  'isRooted',
]);
