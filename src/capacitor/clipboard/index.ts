import { Clipboard } from '@capacitor/clipboard';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useClipboard = createMethodsHook('Clipboard', Clipboard, ['write', 'read']);
