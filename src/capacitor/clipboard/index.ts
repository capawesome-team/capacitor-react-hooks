import { Clipboard } from '@capacitor/clipboard';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useClipboard = createMethodsHook('Clipboard', Clipboard, ['write', 'read']);
