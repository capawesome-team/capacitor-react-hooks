import { FileManager } from '@capawesome-team/capacitor-file-manager';
import { act, renderHook } from '@testing-library/react';

import { useFileManager, useOperationProgress } from '../../src/capawesome/file-manager';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-file-manager', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.exists = vi.fn(async () => ({ exists: true }));
  fake.plugin.readFile = vi.fn(async () => ({ data: 'Q2FwYXdlc29tZQ==' }));
  fake.plugin.cancelOperationById = vi.fn(async () => undefined);
  return { FileManager: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FileManager as unknown as { __fake: FakePlugin }).__fake;
const cancelOperationById = vi.mocked(FileManager.cancelOperationById);

const flushMicrotasks = () => act(() => Promise.resolve());
const progressEvent = {
  id: 'copy-1',
  operationType: 'COPY_DIRECTORY',
  processedBytes: 512,
  processedFiles: 2,
  totalBytes: 1024,
  totalFiles: 4,
};

describe('capawesome/file-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useOperationProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useOperationProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('operationProgress', progressEvent));
    expect(callback).toHaveBeenCalledExactlyOnceWith(progressEvent);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('operationProgress')).toBe(0);
  });

  it('useOperationProgress delivers the events of every operation', async () => {
    const callback = vi.fn();
    renderHook(() => useOperationProgress(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('operationProgress', progressEvent));
    act(() => fake.emit('operationProgress', { ...progressEvent, id: null }));
    expect(callback).toHaveBeenLastCalledWith({ ...progressEvent, id: null });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('useFileManager exposes exists', async () => {
    const { result } = renderHook(() => useFileManager(), { wrapper: StrictModeWrapper });
    await expect(result.current.exists({ uri: 'file:///document.pdf' })).resolves.toEqual({
      exists: true,
    });
  });

  it('useFileManager forwards the options of cancelOperationById', async () => {
    const { result } = renderHook(() => useFileManager(), { wrapper: StrictModeWrapper });
    await result.current.cancelOperationById({ id: 'copy-1' });
    expect(cancelOperationById).toHaveBeenCalledExactlyOnceWith({ id: 'copy-1' });
  });
});
