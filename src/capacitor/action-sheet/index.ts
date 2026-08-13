import { ActionSheet } from '@capacitor/action-sheet';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useActionSheet = createMethodsHook('ActionSheet', ActionSheet, ['showActions']);
