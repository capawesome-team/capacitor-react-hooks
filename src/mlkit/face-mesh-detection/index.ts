import { FaceMeshDetection } from '@capacitor-mlkit/face-mesh-detection';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` detects face meshes in the image at the given local file path.
 *
 * Only available on Android.
 */
export const useFaceMeshDetection = createMethodsHook('FaceMeshDetection', FaceMeshDetection, [
  'processImage',
]);
