import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import type { StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBarcodeScannerSession,
  useBarcodeScanning,
  useBarcodeScanningPermissions,
  useGoogleBarcodeScannerModuleInstallProgress,
} from '../../src/mlkit/barcode-scanning';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/barcode-scanning', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.startScan = vi.fn(async () => undefined);
  fake.plugin.stopScan = vi.fn(async () => undefined);
  fake.plugin.isSupported = vi.fn(async () => ({ supported: true }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ camera: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ camera: 'granted' }));
  return { BarcodeScanner: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (BarcodeScanner as unknown as { __fake: FakePlugin }).__fake;
const startScan = vi.mocked(BarcodeScanner.startScan);
const stopScan = vi.mocked(BarcodeScanner.stopScan);

const flushMicrotasks = () => act(() => Promise.resolve());
const barcode = { displayValue: 'CapacitorJS', format: 'QR_CODE', valueType: 'TEXT' };

describe('mlkit/barcode-scanning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBarcodeScannerSession starts scanning and collects scanned barcodes', async () => {
    const options: StartScanOptions = { formats: [] };
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('barcodesScanned')).toBe(0);

    await act(() => result.current.start(options));
    await flushMicrotasks();
    expect(startScan).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isScanning).toBe(true);
    expect(fake.listenerCount('barcodesScanned')).toBe(1);

    act(() => fake.emit('barcodesScanned', { barcodes: [barcode] }));
    expect(result.current.barcodes).toEqual([barcode]);
  });

  it('useBarcodeScannerSession replaces the barcodes on every scan event', async () => {
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();
    act(() => fake.emit('barcodesScanned', { barcodes: [barcode] }));
    act(() => fake.emit('barcodesScanned', { barcodes: [] }));
    expect(result.current.barcodes).toEqual([]);
  });

  it('useBarcodeScannerSession stops the scan and detaches the listener on stop', async () => {
    const { result } = renderHook(() => useBarcodeScannerSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
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
    await act(() => result.current.start());
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

  it('useGoogleBarcodeScannerModuleInstallProgress delivers progress events', async () => {
    const callback = vi.fn();
    renderHook(() => useGoogleBarcodeScannerModuleInstallProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('googleBarcodeScannerModuleInstallProgress', { state: 2, progress: 42 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ state: 2, progress: 42 });
  });

  it('useBarcodeScanningPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useBarcodeScanningPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ camera: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ camera: 'granted' });
  });

  it('useBarcodeScanning exposes isSupported', async () => {
    const { result } = renderHook(() => useBarcodeScanning(), { wrapper: StrictModeWrapper });
    await expect(result.current.isSupported()).resolves.toEqual({ supported: true });
  });
});
