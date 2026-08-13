import { FileViewer } from '@capacitor/file-viewer';
import { renderHook } from '@testing-library/react';

import { useFileViewer } from '../../src/capacitor/file-viewer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/file-viewer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.openDocumentFromLocalPath = vi.fn(async () => undefined);
  fake.plugin.openDocumentFromResources = vi.fn(async () => undefined);
  fake.plugin.openDocumentFromUrl = vi.fn(async () => undefined);
  fake.plugin.previewMediaContentFromLocalPath = vi.fn(async () => undefined);
  fake.plugin.previewMediaContentFromResources = vi.fn(async () => undefined);
  fake.plugin.previewMediaContentFromUrl = vi.fn(async () => undefined);
  return { FileViewer: fake.plugin };
});

describe('capacitor/file-viewer', () => {
  it('useFileViewer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFileViewer(), { wrapper: StrictModeWrapper });
    await result.current.openDocumentFromLocalPath({ path: '/data/report.pdf' });
    expect(FileViewer.openDocumentFromLocalPath).toHaveBeenCalledWith({
      path: '/data/report.pdf',
    });
    await result.current.previewMediaContentFromUrl({ url: 'https://example.com/clip.mp4' });
    expect(FileViewer.previewMediaContentFromUrl).toHaveBeenCalledWith({
      url: 'https://example.com/clip.mp4',
    });
    expect(typeof result.current.openDocumentFromResources).toBe('function');
    expect(typeof result.current.openDocumentFromUrl).toBe('function');
    expect(typeof result.current.previewMediaContentFromLocalPath).toBe('function');
    expect(typeof result.current.previewMediaContentFromResources).toBe('function');
  });
});
