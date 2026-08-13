import { FileViewer } from '@capacitor/file-viewer';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useFileViewer = createMethodsHook('FileViewer', FileViewer, [
  'openDocumentFromLocalPath',
  'openDocumentFromResources',
  'openDocumentFromUrl',
  'previewMediaContentFromLocalPath',
  'previewMediaContentFromResources',
  'previewMediaContentFromUrl',
]);
