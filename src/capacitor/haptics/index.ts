import { Haptics } from '@capacitor/haptics';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useHaptics = createMethodsHook('Haptics', Haptics, [
  'impact',
  'notification',
  'vibrate',
  'selectionStart',
  'selectionChanged',
  'selectionEnd',
]);
