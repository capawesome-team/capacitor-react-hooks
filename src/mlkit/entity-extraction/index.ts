import { EntityExtraction } from '@capacitor-mlkit/entity-extraction';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `extractEntities` requires the model of the given language to be downloaded
 * first. The plugin emits no download progress event, so `downloadModel` can
 * only be surfaced as a pending flag. Call `getDownloadedModels` again after a
 * download or deletion to refresh the list of locally available languages.
 */
export const useEntityExtraction = createMethodsHook('EntityExtraction', EntityExtraction, [
  'deleteDownloadedModel',
  'downloadModel',
  'extractEntities',
  'getDownloadedModels',
]);
