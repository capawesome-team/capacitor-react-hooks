import { BatteryOptimization } from '@capawesome-team/capacitor-android-battery-optimization';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useBatteryOptimization = createMethodsHook(
  'BatteryOptimization',
  BatteryOptimization,
  [
    'isBatteryOptimizationEnabled',
    'openBatteryOptimizationSettings',
    'requestIgnoreBatteryOptimization',
  ],
);
