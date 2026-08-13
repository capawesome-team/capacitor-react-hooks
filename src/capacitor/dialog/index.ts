import { Dialog } from '@capacitor/dialog';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useDialog = createMethodsHook('Dialog', Dialog, ['alert', 'prompt', 'confirm']);
