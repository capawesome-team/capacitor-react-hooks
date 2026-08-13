import { Filesystem } from '@capacitor/filesystem';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useFilesystem, useFilesystemPermissions } from '../../src/capacitor/filesystem';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/filesystem', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.readFile = vi.fn(async () => ({ data: 'aGVsbG8=' }));
  fake.plugin.readFileInChunks = vi.fn(async () => 'callback-1');
  fake.plugin.writeFile = vi.fn(async () => ({ uri: 'file:///data/hello.txt' }));
  fake.plugin.appendFile = vi.fn(async () => undefined);
  fake.plugin.deleteFile = vi.fn(async () => undefined);
  fake.plugin.mkdir = vi.fn(async () => undefined);
  fake.plugin.rmdir = vi.fn(async () => undefined);
  fake.plugin.readdir = vi.fn(async () => ({ files: [] }));
  fake.plugin.getUri = vi.fn(async () => ({ uri: 'file:///data/hello.txt' }));
  fake.plugin.stat = vi.fn(async () => ({ type: 'file', size: 5, mtime: 0, uri: 'hello.txt' }));
  fake.plugin.rename = vi.fn(async () => undefined);
  fake.plugin.copy = vi.fn(async () => ({ uri: 'file:///data/copy.txt' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ publicStorage: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ publicStorage: 'granted' }));
  return { Filesystem: fake.plugin };
});

describe('capacitor/filesystem', () => {
  it('useFilesystemPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useFilesystemPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ publicStorage: 'granted' }));
  });

  it('useFilesystemPermissions requests the permissions on demand', async () => {
    const { result } = renderHook(() => useFilesystemPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toBeDefined());
    await act(() => result.current.request());
    expect(Filesystem.requestPermissions).toHaveBeenCalled();
    expect(result.current.status).toEqual({ publicStorage: 'granted' });
  });

  it('useFilesystem exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFilesystem(), { wrapper: StrictModeWrapper });
    await expect(result.current.readFile({ path: 'hello.txt' })).resolves.toEqual({
      data: 'aGVsbG8=',
    });
    await expect(result.current.readdir({ path: '' })).resolves.toEqual({ files: [] });
    expect(typeof result.current.writeFile).toBe('function');
    expect(typeof result.current.readFileInChunks).toBe('function');
    expect(typeof result.current.copy).toBe('function');
  });

  it('useFilesystem omits the deprecated download methods', () => {
    const { result } = renderHook(() => useFilesystem(), { wrapper: StrictModeWrapper });
    expect(result.current).not.toHaveProperty('downloadFile');
    expect(result.current).not.toHaveProperty('addListener');
  });
});
