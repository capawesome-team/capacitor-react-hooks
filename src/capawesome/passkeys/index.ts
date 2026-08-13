import { Passkeys } from '@capawesome/capacitor-passkeys';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 */
export const usePasskeys = createMethodsHook('Passkeys', Passkeys, ['createPasskey', 'getPasskey', 'isAvailable']);
