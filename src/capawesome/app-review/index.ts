import { AppReview } from '@capawesome/capacitor-app-review';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS (14+).
 *
 * **Attention**: On iOS, in-app review requests are limited to 3 requests per
 * year.
 */
export const useAppReview = createMethodsHook('AppReview', AppReview, [
  'requestReview',
  'openAppStore',
]);
