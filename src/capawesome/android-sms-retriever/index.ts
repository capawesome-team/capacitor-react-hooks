import { AndroidSmsRetriever } from '@capawesome/capacitor-android-sms-retriever';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `retrieveSms()` waits up to 5 minutes for a matching SMS and rejects with the
 * error code `TIMEOUT` afterwards.
 *
 * Only available on Android.
 */
export const useAndroidSmsRetriever = createMethodsHook(
  'AndroidSmsRetriever',
  AndroidSmsRetriever,
  ['requestPhoneNumber', 'retrieveSms'],
);
