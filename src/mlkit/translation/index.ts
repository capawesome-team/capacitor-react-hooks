import { Translation } from '@capacitor-mlkit/translation';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * Language models are downloaded on demand and the plugin emits no download
 * progress event, so `downloadModel` can only be surfaced as a pending flag.
 * Call `getDownloadedModels` again after a download or deletion to refresh the
 * list of locally available languages.
 */
export const useTranslation = createMethodsHook('Translation', Translation, [
  'deleteDownloadedModel',
  'downloadModel',
  'getDownloadedModels',
  'translate',
]);
