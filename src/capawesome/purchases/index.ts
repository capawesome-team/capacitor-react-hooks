import { Purchases } from '@capawesome-team/capacitor-purchases';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * All methods except `isAvailable` are only available on Android and iOS
 * (15.0+); `getAllTransactions` is only available on iOS (15.0+).
 */
export const usePurchases = createMethodsHook('Purchases', Purchases, [
  'finishTransaction',
  'getAllTransactions',
  'getCurrentTransactions',
  'getProductById',
  'getProductsByIds',
  'getUnfinishedTransactions',
  'isAvailable',
  'isIntroOfferAvailableForProduct',
  'purchaseProduct',
  'syncTransactions',
]);
