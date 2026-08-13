import { AgeSignals } from '@capawesome/capacitor-age-signals';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `getAgeRange` and the `setNext*` / `setUseFakeManager` testing helpers are
 * only available on Android. `getRegulatoryRequirements` and
 * `showSignificantUpdateAcknowledgment` are only available on iOS.
 */
export const useAgeSignals = createMethodsHook('AgeSignals', AgeSignals, [
  'getAgeRange',
  'isAvailable',
  'getRegulatoryRequirements',
  'requestAgeRange',
  'setNextAgeSignalsAccessResult',
  'setNextAgeSignalsException',
  'setNextAgeSignalsResult',
  'setNextRequestAgeSignalsAccessException',
  'setUseFakeManager',
  'showSignificantUpdateAcknowledgment',
]);
