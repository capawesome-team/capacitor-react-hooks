import type { ProgressStatus } from '@capacitor/file-transfer';
import { FileTransfer } from '@capacitor/file-transfer';
import { act, renderHook } from '@testing-library/react';

import { useFileTransfer, useFileTransferProgress } from '../../src/capacitor/file-transfer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/file-transfer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.downloadFile = vi.fn(async () => ({ path: '/data/report.pdf' }));
  fake.plugin.uploadFile = vi.fn(async () => ({ bytesSent: 1024, responseCode: '200' }));
  return { FileTransfer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FileTransfer as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

const createProgress = (url: string, bytes: number): ProgressStatus => ({
  type: 'download',
  url,
  bytes,
  contentLength: 2048,
  lengthComputable: true,
});

describe('capacitor/file-transfer', () => {
  it('useFileTransferProgress delivers progress events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFileTransferProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('progress')).toBe(1);

    const progress = createProgress('https://example.com/report.pdf', 1024);
    act(() => fake.emit('progress', progress));
    expect(callback).toHaveBeenCalledExactlyOnceWith(progress);

    unmount();
    expect(fake.listenerCount('progress')).toBe(0);
  });

  it('useFileTransferProgress reports every transfer through the same listener', async () => {
    const callback = vi.fn();
    renderHook(() => useFileTransferProgress(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const first = createProgress('https://example.com/first.pdf', 512);
    const second = { ...createProgress('https://example.com/second.pdf', 256), type: 'upload' };
    act(() => {
      fake.emit('progress', first);
      fake.emit('progress', second);
    });
    expect(callback.mock.calls.map(([event]) => event)).toEqual([first, second]);
  });

  it('useFileTransferProgress detaches while disabled', async () => {
    const callback = vi.fn();
    renderHook(() => useFileTransferProgress(callback, { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('progress')).toBe(0);
  });

  it('useFileTransfer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFileTransfer(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.downloadFile({ url: 'https://example.com/report.pdf', path: '/data/r.pdf' }),
    ).resolves.toEqual({ path: '/data/report.pdf' });
    await expect(
      result.current.uploadFile({ url: 'https://example.com/upload', path: '/data/r.pdf' }),
    ).resolves.toEqual({ bytesSent: 1024, responseCode: '200' });
  });
});
