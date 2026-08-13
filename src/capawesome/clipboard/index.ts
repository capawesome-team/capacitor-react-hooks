import { Clipboard } from '@capawesome/capacitor-clipboard';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * On Android, `read` only works while the app is in the foreground. On iOS,
 * `read` displays a system paste notification that cannot be suppressed.
 */
export const useClipboard = createMethodsHook('Clipboard', Clipboard, ['read', 'write']);
