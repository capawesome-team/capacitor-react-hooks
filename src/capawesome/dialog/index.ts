import { Dialog } from '@capawesome/capacitor-dialog';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useDialog = createMethodsHook('Dialog', Dialog, ['alert', 'confirm', 'prompt']);
