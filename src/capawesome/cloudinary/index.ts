import { Cloudinary } from '@capawesome/capacitor-cloudinary';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called once before any other method.
 */
export const useCloudinary = createMethodsHook('Cloudinary', Cloudinary, [
  'initialize',
  'uploadResource',
  'downloadResource',
]);
