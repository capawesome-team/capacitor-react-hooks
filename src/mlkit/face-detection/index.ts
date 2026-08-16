import { FaceDetection } from '@capacitor-mlkit/face-detection';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` detects faces in the image at the given local file path.
 *
 * Only available on Android and iOS.
 */
export const useFaceDetection = createMethodsHook('FaceDetection', FaceDetection, ['processImage']);
