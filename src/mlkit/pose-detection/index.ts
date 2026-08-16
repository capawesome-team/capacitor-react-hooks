import { PoseDetection } from '@capacitor-mlkit/pose-detection';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` detects the pose of the most prominent person in the image at
 * the given local file path.
 *
 * Only available on Android and iOS.
 */
export const usePoseDetection = createMethodsHook('PoseDetection', PoseDetection, ['processImage']);
