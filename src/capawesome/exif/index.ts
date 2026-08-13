import { Exif } from '@capawesome/capacitor-exif';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useExif = createMethodsHook('Exif', Exif, ['readExif', 'removeExif', 'writeExif']);
