import { FileCompressor } from '@capawesome-team/capacitor-file-compressor';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `compressImage` supports png, jpeg and webp images only and discards the
 * exif data of the compressed image.
 */
export const useFileCompressor = createMethodsHook('FileCompressor', FileCompressor, [
  'compressImage',
]);
