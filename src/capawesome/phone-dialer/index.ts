import { PhoneDialer } from '@capawesome/capacitor-phone-dialer';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `dial` only opens the native dialer: the user decides whether the call is
 * placed. Only available on Android and iOS.
 */
export const usePhoneDialer = createMethodsHook('PhoneDialer', PhoneDialer, ['canDial', 'dial']);
