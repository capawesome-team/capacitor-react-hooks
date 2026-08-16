import { DocumentScanner } from '@capawesome-team/capacitor-document-scanner';
import { renderHook } from '@testing-library/react';

import { useDocumentScanner } from '../../src/capawesome/document-scanner';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-document-scanner', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.scanDocument = vi.fn(async () => ({
    pdf: null,
    scannedImages: ['file:///page.jpg'],
  }));
  return { DocumentScanner: fake.plugin };
});

const scanDocument = vi.mocked(DocumentScanner.scanDocument);

describe('capawesome/document-scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDocumentScanner exposes isAvailable', async () => {
    const { result } = renderHook(() => useDocumentScanner(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true });
  });

  it('useDocumentScanner forwards the options of scanDocument', async () => {
    const { result } = renderHook(() => useDocumentScanner(), { wrapper: StrictModeWrapper });
    await expect(result.current.scanDocument({ pageLimit: 1 })).resolves.toEqual({
      pdf: null,
      scannedImages: ['file:///page.jpg'],
    });
    expect(scanDocument).toHaveBeenCalledExactlyOnceWith({ pageLimit: 1 });
  });

  it('useDocumentScanner returns a stable reference across renders', () => {
    const { result, rerender } = renderHook(() => useDocumentScanner(), {
      wrapper: StrictModeWrapper,
    });
    const previous = result.current.scanDocument;
    rerender();
    expect(result.current.scanDocument).toBe(previous);
  });
});
