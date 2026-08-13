import type { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { renderHook } from '@testing-library/react';

import { useBarcodeScanner } from '../../src/capacitor/barcode-scanner';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/barcode-scanner', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.scanBarcode = vi.fn(async () => ({ ScanResult: 'https://capawesome.io', format: 0 }));
  return { CapacitorBarcodeScanner: fake.plugin };
});

const allFormats = 17 as CapacitorBarcodeScannerTypeHint;

describe('capacitor/barcode-scanner', () => {
  it('useBarcodeScanner exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBarcodeScanner(), { wrapper: StrictModeWrapper });
    await expect(result.current.scanBarcode({ hint: allFormats })).resolves.toEqual({
      ScanResult: 'https://capawesome.io',
      format: 0,
    });
    expect(CapacitorBarcodeScanner.scanBarcode).toHaveBeenCalledWith({ hint: allFormats });
  });
});
