import { TextRecognition } from '@capacitor-mlkit/text-recognition';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` recognizes text in the image at the given local file path.
 *
 * Only available on Android and iOS.
 */
export const useTextRecognition = createMethodsHook('TextRecognition', TextRecognition, [
  'processImage',
]);
