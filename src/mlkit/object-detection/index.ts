import { ObjectDetection } from '@capacitor-mlkit/object-detection';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` detects objects in the image at the given local file path.
 *
 * Only available on Android and iOS.
 */
export const useObjectDetection = createMethodsHook('ObjectDetection', ObjectDetection, [
  'processImage',
]);
