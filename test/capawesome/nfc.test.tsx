import { Nfc } from '@capawesome-team/capacitor-nfc';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useNfc,
  useNfcPermissions,
  useNfcScanSession,
  useNfcTagScanned,
} from '../../src/capawesome/nfc';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-nfc', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.startScanSession = vi.fn(async () => undefined);
  fake.plugin.stopScanSession = vi.fn(async () => undefined);
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.isEnabled = vi.fn(async () => ({ isEnabled: true }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ nfc: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ nfc: 'granted' }));
  return { Nfc: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Nfc as unknown as { __fake: FakePlugin }).__fake;
const startScanSession = vi.mocked(Nfc.startScanSession);
const stopScanSession = vi.mocked(Nfc.stopScanSession);

const flushMicrotasks = () => act(() => Promise.resolve());
const nfcTag = { id: [1, 2, 3] };

describe('capawesome/nfc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useNfc exposes the plugin methods', async () => {
    const { result } = renderHook(() => useNfc(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
    expect(Nfc.isAvailable).toHaveBeenCalled();
    await expect(result.current.isEnabled()).resolves.toEqual({ isEnabled: true });
  });

  it('useNfcPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useNfcPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ nfc: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ nfc: 'granted' });
  });

  it('useNfcScanSession starts the session and collects the scanned tag', async () => {
    const options = { alertMessage: 'Hold your iPhone near the NFC tag.' };
    const { result } = renderHook(() => useNfcScanSession(), { wrapper: StrictModeWrapper });
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('nfcTagScanned')).toBe(0);

    await act(() => result.current.start(options));
    await flushMicrotasks();
    expect(startScanSession).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isScanning).toBe(true);
    expect(fake.listenerCount('nfcTagScanned')).toBe(1);

    act(() => fake.emit('nfcTagScanned', { nfcTag }));
    expect(result.current.nfcTag).toEqual(nfcTag);
  });

  it('useNfcScanSession stops the session and detaches the listener on stop', async () => {
    const { result } = renderHook(() => useNfcScanSession(), { wrapper: StrictModeWrapper });
    await act(() => result.current.start());
    await flushMicrotasks();

    await act(() => result.current.stop());
    await flushMicrotasks();
    expect(stopScanSession).toHaveBeenCalledOnce();
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('nfcTagScanned')).toBe(0);
  });

  it('useNfcScanSession ends the session when it is canceled', async () => {
    const { result } = renderHook(() => useNfcScanSession(), { wrapper: StrictModeWrapper });
    await act(() => result.current.start());
    await flushMicrotasks();

    act(() => fake.emit('scanSessionCanceled'));
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('nfcTagScanned')).toBe(0);
  });

  it('useNfcScanSession stops the session on unmount', async () => {
    const { result, unmount } = renderHook(() => useNfcScanSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopScanSession).toHaveBeenCalledOnce();
    expect(fake.listenerCount('nfcTagScanned')).toBe(0);
  });

  it('useNfcScanSession does not stop a session that was never started', async () => {
    const { unmount } = renderHook(() => useNfcScanSession(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopScanSession).not.toHaveBeenCalled();
  });

  it('useNfcTagScanned delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useNfcTagScanned(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('nfcTagScanned', { nfcTag }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ nfcTag });
    unmount();
    expect(fake.listenerCount('nfcTagScanned')).toBe(0);
  });
});
