import { AndroidIntentLauncher } from '@capawesome/capacitor-android-intent-launcher';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useAndroidIntentLauncher = createMethodsHook(
  'AndroidIntentLauncher',
  AndroidIntentLauncher,
  ['canResolveActivity', 'startActivity'],
);
