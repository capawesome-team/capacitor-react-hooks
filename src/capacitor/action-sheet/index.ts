import { ActionSheet } from '@capacitor/action-sheet';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useActionSheet = createMethodsHook('ActionSheet', ActionSheet, ['showActions']);
