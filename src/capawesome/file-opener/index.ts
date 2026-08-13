import { FileOpener } from '@capawesome-team/capacitor-file-opener';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFileOpener = createMethodsHook('FileOpener', FileOpener, ['openFile']);
