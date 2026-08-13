import { PdfGenerator } from '@capawesome/capacitor-pdf-generator';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const usePdfGenerator = createMethodsHook('PdfGenerator', PdfGenerator, [
  'generateFromHtml',
  'generateFromUrl',
]);
