import { PdfViewer } from '@capawesome/capacitor-pdf-viewer';
import { act, renderHook } from '@testing-library/react';

import {
  usePdfViewer,
  usePdfViewerClosed,
  usePdfViewerPageChange,
} from '../../src/capawesome/pdf-viewer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-pdf-viewer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.open = vi.fn(async () => undefined);
  fake.plugin.close = vi.fn(async () => undefined);
  return { PdfViewer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (PdfViewer as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/pdf-viewer', () => {
  it('usePdfViewer exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePdfViewer(), { wrapper: StrictModeWrapper });
    await expect(result.current.open({ path: '/tmp/report.pdf' })).resolves.toBeUndefined();
    expect(PdfViewer.open).toHaveBeenCalledWith({ path: '/tmp/report.pdf' });
    await expect(result.current.close()).resolves.toBeUndefined();
  });

  it('usePdfViewerClosed delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePdfViewerClosed(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('closed'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('closed')).toBe(0);
  });

  it('usePdfViewerPageChange delivers page changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePdfViewerPageChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('pageChange', { page: 3 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ page: 3 });
    unmount();
    expect(fake.listenerCount('pageChange')).toBe(0);
  });
});
