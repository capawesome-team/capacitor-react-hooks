import { ActionSheet } from '@capawesome/capacitor-action-sheet';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useActionSheet = createMethodsHook('ActionSheet', ActionSheet, ['showActions']);
