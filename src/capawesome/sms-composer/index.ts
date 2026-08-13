import { SmsComposer } from '@capawesome/capacitor-sms-composer';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `composeSms` only opens the native composer: the user decides whether the
 * message is sent. Only available on Android and iOS.
 */
export const useSmsComposer = createMethodsHook('SmsComposer', SmsComposer, [
  'canComposeSms',
  'composeSms',
]);
