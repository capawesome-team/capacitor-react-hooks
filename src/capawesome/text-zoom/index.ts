import { TextZoom } from '@capawesome/capacitor-text-zoom';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * The zoom set with `setZoom` is not persisted across app restarts.
 */
export const useTextZoom = createMethodsHook('TextZoom', TextZoom, [
  'getZoom',
  'getPreferredZoom',
  'setZoom',
]);
