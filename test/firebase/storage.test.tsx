import { FirebaseStorage } from '@capacitor-firebase/storage';
import { act, renderHook } from '@testing-library/react';

import { useDownloadFile, useFirebaseStorage, useUploadFile } from '../../src/firebase/storage';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/storage', () => {
  type TransferCallback = (event: unknown, error: unknown) => void;
  const callbacks = new Map<string, TransferCallback>();
  let nextCallbackId = 0;
  const startTransfer = (name: string) =>
    vi.fn((options: unknown, callback: TransferCallback) => {
      callbacks.set(name, callback);
      return Promise.resolve(`callback-${++nextCallbackId}`);
    });
  const plugin = {
    uploadFile: startTransfer('upload'),
    downloadFile: startTransfer('download'),
    getDownloadUrl: vi.fn(async () => ({ downloadUrl: 'https://example.com/mountains.png' })),
    deleteFile: vi.fn(async () => undefined),
  };
  const fake = {
    emit: (name: string, event: unknown, error: unknown = null) =>
      callbacks.get(name)?.(event, error),
  };
  return { FirebaseStorage: Object.assign(plugin, { __fake: fake }) };
});

interface FakeStorage {
  emit(name: string, event: unknown, error?: unknown): void;
}

const fake = (FirebaseStorage as unknown as { __fake: FakeStorage }).__fake;

const uploadOptions = { path: 'images/mountains.png', uri: 'file:///mountains.png' };

describe('firebase/storage', () => {
  it('useUploadFile reports progress until the upload is completed', async () => {
    const { result } = renderHook(() => useUploadFile(), { wrapper: StrictModeWrapper });
    expect(result.current.isTransferring).toBe(false);

    await act(() => result.current.upload(uploadOptions));
    expect(FirebaseStorage.uploadFile).toHaveBeenCalledWith(uploadOptions, expect.any(Function));
    expect(result.current.isTransferring).toBe(true);
    expect(result.current.event).toBeUndefined();

    act(() => fake.emit('upload', { progress: 0.5, completed: false }));
    expect(result.current.event).toEqual({ progress: 0.5, completed: false });
    expect(result.current.isTransferring).toBe(true);

    act(() => fake.emit('upload', { progress: 1, completed: true }));
    expect(result.current.event).toEqual({ progress: 1, completed: true });
    expect(result.current.isTransferring).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('useUploadFile routes in-band errors to error and ends the upload', async () => {
    const { result } = renderHook(() => useUploadFile(), { wrapper: StrictModeWrapper });
    await act(() => result.current.upload(uploadOptions));
    act(() => fake.emit('upload', null, 'storage/unauthorized'));
    expect(result.current.error).toEqual(new Error('storage/unauthorized'));
    expect(result.current.isTransferring).toBe(false);
  });

  it('useUploadFile exposes a rejected start and resets the state on the next upload', async () => {
    const { result } = renderHook(() => useUploadFile(), { wrapper: StrictModeWrapper });
    vi.mocked(FirebaseStorage.uploadFile).mockRejectedValueOnce(new Error('offline'));
    await act(() => result.current.upload(uploadOptions));
    expect(result.current.error).toEqual(new Error('offline'));
    expect(result.current.isTransferring).toBe(false);

    await act(() => result.current.upload(uploadOptions));
    expect(result.current.error).toBeUndefined();
    expect(result.current.isTransferring).toBe(true);
  });

  it('useUploadFile ignores callbacks that arrive after unmount', async () => {
    const { result, unmount } = renderHook(() => useUploadFile(), { wrapper: StrictModeWrapper });
    await act(() => result.current.upload(uploadOptions));
    unmount();
    expect(() => fake.emit('upload', { progress: 1, completed: true })).not.toThrow();
    expect(result.current.event).toBeUndefined();
    expect(result.current.isTransferring).toBe(true);
  });

  it('useDownloadFile reports progress until the download is completed', async () => {
    const { result } = renderHook(() => useDownloadFile(), { wrapper: StrictModeWrapper });
    await act(() => result.current.download({ path: 'images/mountains.png' }));
    expect(result.current.isTransferring).toBe(true);

    act(() => fake.emit('download', { progress: 1, completed: true }));
    expect(result.current.event).toEqual({ progress: 1, completed: true });
    expect(result.current.isTransferring).toBe(false);
  });

  it('useFirebaseStorage exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseStorage(), { wrapper: StrictModeWrapper });
    await expect(result.current.getDownloadUrl({ path: 'images/mountains.png' })).resolves.toEqual({
      downloadUrl: 'https://example.com/mountains.png',
    });
  });
});
