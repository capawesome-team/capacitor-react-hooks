import { ManagedConfigurations } from '@capawesome/capacitor-managed-configurations';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useManagedConfigurations = createMethodsHook(
  'ManagedConfigurations',
  ManagedConfigurations,
  ['getString', 'getNumber', 'getBoolean'],
);
