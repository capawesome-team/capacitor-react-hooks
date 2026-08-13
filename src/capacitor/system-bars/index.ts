import { SystemBars } from '@capacitor/core';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `SystemBars` controls the status bar and the navigation bar. It is the
 * successor of the status bar plugin and ships with `@capacitor/core`, so no
 * additional plugin needs to be installed.
 */
export const useSystemBars = createMethodsHook('SystemBars', SystemBars, [
  'setStyle',
  'show',
  'hide',
  'setAnimation',
]);
