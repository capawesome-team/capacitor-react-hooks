import { AppLauncher } from '@capacitor/app-launcher';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useAppLauncher = createMethodsHook('AppLauncher', AppLauncher, [
  'canOpenUrl',
  'openUrl',
]);
