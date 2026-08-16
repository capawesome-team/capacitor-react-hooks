import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { act, renderHook } from '@testing-library/react';

import {
  useDocumentScanner,
  useGoogleDocumentScannerModuleInstallProgress,
} from '../../src/mlkit/document-scanner';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/document-scanner', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.scanDocument = vi.fn(async () => ({ scannedImages: ['file:///page-1.jpg'] }));
  fake.plugin.isGoogleDocumentScannerModuleAvailable = vi.fn(async () => ({ available: false }));
  fake.plugin.installGoogleDocumentScannerModule = vi.fn(async () => undefined);
  return { DocumentScanner: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (DocumentScanner as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/document-scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDocumentScanner exposes the plugin methods', async () => {
    const options = { pageLimit: 1 };
    const { result } = renderHook(() => useDocumentScanner(), { wrapper: StrictModeWrapper });

    await expect(result.current.scanDocument(options)).resolves.toEqual({
      scannedImages: ['file:///page-1.jpg'],
    });
    expect(DocumentScanner.scanDocument).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.isGoogleDocumentScannerModuleAvailable()).resolves.toEqual({
      available: false,
    });
    await expect(result.current.installGoogleDocumentScannerModule()).resolves.toBeUndefined();
  });

  it('useDocumentScanner keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useDocumentScanner(), {
      wrapper: StrictModeWrapper,
    });
    const { scanDocument } = result.current;
    rerender();
    expect(result.current.scanDocument).toBe(scanDocument);
  });

  it('useGoogleDocumentScannerModuleInstallProgress delivers progress events', async () => {
    const callback = vi.fn();
    renderHook(() => useGoogleDocumentScannerModuleInstallProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('googleDocumentScannerModuleInstallProgress')).toBe(1);

    act(() => fake.emit('googleDocumentScannerModuleInstallProgress', { state: 2, progress: 42 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ state: 2, progress: 42 });
  });

  it('useGoogleDocumentScannerModuleInstallProgress removes the listener on unmount', async () => {
    const { unmount } = renderHook(() => useGoogleDocumentScannerModuleInstallProgress(vi.fn()), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('googleDocumentScannerModuleInstallProgress')).toBe(0);
  });
});
