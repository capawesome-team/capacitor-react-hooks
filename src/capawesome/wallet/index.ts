import { Wallet } from '@capawesome/capacitor-wallet';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `addPasses` and `canAddPasses` are only available on iOS,
 * `saveToGoogleWallet` only on Android.
 */
export const useWallet = createMethodsHook('Wallet', Wallet, [
  'addPasses',
  'canAddPasses',
  'saveToGoogleWallet',
]);
