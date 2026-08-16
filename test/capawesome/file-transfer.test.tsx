import { FileTransfer } from '@capawesome-team/capacitor-file-transfer';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useFileTransfer,
  useFileTransferPermissions,
  useTransferCompleted,
  useTransferProgress,
} from '../../src/capawesome/file-transfer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-file-transfer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getTransfers = vi.fn(async () => ({ transfers: [] }));
  fake.plugin.startDownload = vi.fn(async () => ({ id: 'transfer-1' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ notifications: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ notifications: 'granted' }));
  return { FileTransfer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FileTransfer as unknown as { __fake: FakePlugin }).__fake;
const startDownload = vi.mocked(FileTransfer.startDownload);

const flushMicrotasks = () => act(() => Promise.resolve());
const progressEvent = { id: 'transfer-1', bytes: 512, totalBytes: 1024, progress: 0.5 };

describe('capawesome/file-transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useTransferProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTransferProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('transferProgress', progressEvent));
    expect(callback).toHaveBeenCalledExactlyOnceWith(progressEvent);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('transferProgress')).toBe(0);
  });

  it('useTransferProgress delivers the events of every transfer', async () => {
    const callback = vi.fn();
    renderHook(() => useTransferProgress(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('transferProgress', progressEvent));
    act(() => fake.emit('transferProgress', { ...progressEvent, id: 'transfer-2' }));
    expect(callback).toHaveBeenLastCalledWith({ ...progressEvent, id: 'transfer-2' });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('useTransferCompleted delivers events', async () => {
    const callback = vi.fn();
    const completedEvent = {
      id: 'transfer-1',
      path: 'file:///document.pdf',
      responseCode: 200,
      responseBody: null,
    };
    renderHook(() => useTransferCompleted(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('transferCompleted', completedEvent));
    expect(callback).toHaveBeenCalledExactlyOnceWith(completedEvent);
  });

  it('useFileTransferPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useFileTransferPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ notifications: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ notifications: 'granted' });
  });

  it('useFileTransfer exposes startDownload', async () => {
    const { result } = renderHook(() => useFileTransfer(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.startDownload({ url: 'https://example.com/f.pdf', path: 'file:///f.pdf' }),
    ).resolves.toEqual({ id: 'transfer-1' });
    expect(startDownload).toHaveBeenCalledExactlyOnceWith({
      url: 'https://example.com/f.pdf',
      path: 'file:///f.pdf',
    });
  });
});
