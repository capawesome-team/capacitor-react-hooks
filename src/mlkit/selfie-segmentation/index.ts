import { SelfieSegmentation } from '@capacitor-mlkit/selfie-segmentation';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` separates the person from the background in the image at the
 * given local file path and resolves with the file path of the result.
 *
 * Only available on Android and iOS.
 */
export const useSelfieSegmentation = createMethodsHook('SelfieSegmentation', SelfieSegmentation, [
  'processImage',
]);
