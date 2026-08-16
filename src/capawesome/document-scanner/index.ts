import { DocumentScanner } from '@capawesome-team/capacitor-document-scanner';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useDocumentScanner = createMethodsHook('DocumentScanner', DocumentScanner, [
  'isAvailable',
  'scanDocument',
]);
