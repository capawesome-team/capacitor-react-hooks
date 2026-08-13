import { Haptics } from '@capacitor/haptics';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useHaptics = createMethodsHook('Haptics', Haptics, [
  'impact',
  'notification',
  'vibrate',
  'selectionStart',
  'selectionChanged',
  'selectionEnd',
]);
