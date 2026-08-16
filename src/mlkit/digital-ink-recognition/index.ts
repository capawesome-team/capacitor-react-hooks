import { DigitalInkRecognition } from '@capacitor-mlkit/digital-ink-recognition';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `recognize` requires the model of the given language tag to be downloaded
 * first. The plugin emits no download progress event, so `downloadModel` can
 * only be surfaced as a pending flag. Call `getDownloadedModels` again after a
 * download or deletion to refresh the list of locally available models.
 */
export const useDigitalInkRecognition = createMethodsHook(
  'DigitalInkRecognition',
  DigitalInkRecognition,
  ['deleteDownloadedModel', 'downloadModel', 'getDownloadedModels', 'recognize'],
);
