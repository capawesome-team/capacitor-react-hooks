import { Sim } from '@capawesome/capacitor-sim';

import { createMethodsHook, createPermissionsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useSim = createMethodsHook('Sim', Sim, [
  'checkPermissions',
  'getSimCards',
  'requestPermissions',
]);

/**
 * Status of the permission to read the SIM cards with imperative `check` and
 * `request`. Only available on Android.
 */
export const useSimPermissions = createPermissionsHook(Sim);
