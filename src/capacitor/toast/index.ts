import { Toast } from '@capacitor/toast';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useToast = createMethodsHook('Toast', Toast, ['show']);
