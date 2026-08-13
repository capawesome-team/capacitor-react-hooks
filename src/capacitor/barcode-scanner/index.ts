import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `scanBarcode` opens the full screen scanner and resolves with the first
 * barcode that is scanned, so there is no scan session to keep in state.
 */
export const useBarcodeScanner = createMethodsHook(
  'CapacitorBarcodeScanner',
  CapacitorBarcodeScanner,
  ['scanBarcode'],
);
