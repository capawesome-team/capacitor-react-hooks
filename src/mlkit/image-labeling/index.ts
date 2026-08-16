import { ImageLabeling } from '@capacitor-mlkit/image-labeling';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` detects labels in the image at the given local file path.
 *
 * Only available on Android and iOS.
 */
export const useImageLabeling = createMethodsHook('ImageLabeling', ImageLabeling, ['processImage']);
