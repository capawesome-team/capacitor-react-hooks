import { BarcodeScanner } from '@capawesome-team/capacitor-barcode-scanner';
import type { StartScanOptions } from '@capawesome-team/capacitor-barcode-scanner';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBarcodeScanner,
  useBarcodeScannerPermissions,
  useBarcodeScannerSession,
  useScanError,
} from '../../src/capawesome/barcode-scanner';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-barcode-scanner', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.startScan = vi.fn(async () => undefined);
  fake.plugin.stopScan = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ camera: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ camera: 'granted' }));
  return { BarcodeScanner: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (BarcodeScanner as unknown as { __fake: FakePlugin }).__fake;
const startScan = vi.mocked(BarcodeScanner.startScan);
const stopScan = vi.mocked(BarcodeScanner.stopScan);

const flushMicrotasks = () => act(() => Promise.resolve());
const scanOptions: StartScanOptions = { frame: { height: 200, width: 300, x: 0, y: 0 } };
const barcode = { displayValue: 'CapacitorJS', format: 'QR_CODE', rawValue: 'CapacitorJS' };

describe('capawesome/barcode-scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBarcodeScannerSession starts scanning and collects scanned barcodes', async () => {
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('barcodesScanned')).toBe(0);

    await act(() => result.current.start(scanOptions));
    await flushMicrotasks();
    expect(startScan).toHaveBeenCalledExactlyOnceWith(scanOptions);
    expect(result.current.isScanning).toBe(true);
    expect(fake.listenerCount('barcodesScanned')).toBe(1);

    act(() => fake.emit('barcodesScanned', { barcodes: [barcode] }));
    expect(result.current.barcodes).toEqual([barcode]);
  });

  it('useBarcodeScannerSession stops the scan and detaches the listener on stop', async () => {
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start(scanOptions));
    await flushMicrotasks();

    await act(() => result.current.stop());
    await flushMicrotasks();
    expect(stopScan).toHaveBeenCalledOnce();
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('barcodesScanned')).toBe(0);
  });

  it('useBarcodeScannerSession stops the scan and detaches the listener on unmount', async () => {
    const { result, unmount } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start(scanOptions));
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopScan).toHaveBeenCalledOnce();
    expect(fake.listenerCount('barcodesScanned')).toBe(0);
  });

  it('useBarcodeScannerSession does not stop a scan that was never started', async () => {
    const { unmount } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopScan).not.toHaveBeenCalled();
  });

  it('useBarcodeScannerSession keeps the session stopped when the start fails', async () => {
    startScan.mockRejectedValueOnce(new Error('ALREADY_SCANNING'));
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await expect(act(() => result.current.start(scanOptions))).rejects.toThrow('ALREADY_SCANNING');
    expect(result.current.isScanning).toBe(false);
  });

  it('useScanError delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useScanError(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('scanError', { message: 'An unknown error has occurred.' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({
      message: 'An unknown error has occurred.',
    });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('scanError')).toBe(0);
  });

  it('useBarcodeScannerPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useBarcodeScannerPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ camera: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ camera: 'granted' });
  });

  it('useBarcodeScanner exposes isAvailable', async () => {
    const { result } = renderHook(() => useBarcodeScanner(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true });
  });
});
