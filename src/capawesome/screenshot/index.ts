import { Screenshot } from '@capawesome/capacitor-screenshot';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useScreenshot = createMethodsHook('Screenshot', Screenshot, ['take']);
