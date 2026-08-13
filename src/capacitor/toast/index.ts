import { Toast } from '@capacitor/toast';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useToast = createMethodsHook('Toast', Toast, ['show']);
