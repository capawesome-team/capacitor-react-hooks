import { PhotoManipulator } from '@capawesome/capacitor-photo-manipulator';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const usePhotoManipulator = createMethodsHook('PhotoManipulator', PhotoManipulator, [
  'getInfo',
  'transform',
]);
