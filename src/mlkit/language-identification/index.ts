import { LanguageIdentification } from '@capacitor-mlkit/language-identification';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useLanguageIdentification = createMethodsHook(
  'LanguageIdentification',
  LanguageIdentification,
  ['identifyLanguage', 'identifyPossibleLanguages'],
);
