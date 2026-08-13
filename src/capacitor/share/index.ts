import { Share } from '@capacitor/share';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useShare = createMethodsHook('Share', Share, ['canShare', 'share']);
