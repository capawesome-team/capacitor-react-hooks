import { FilePicker } from '@capawesome/capacitor-file-picker';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useFilePicker,
  useFilePickerDismissed,
  useFilePickerPermissions,
} from '../../src/capawesome/file-picker';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-file-picker', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.pickFiles = vi.fn(async () => ({ files: [{ name: 'report.pdf' }] }));
  fake.plugin.pickDirectory = vi.fn(async () => ({ path: '/tmp' }));
  fake.plugin.pickImages = vi.fn(async () => ({ files: [] }));
  fake.plugin.pickMedia = vi.fn(async () => ({ files: [] }));
  fake.plugin.pickVideos = vi.fn(async () => ({ files: [] }));
  fake.plugin.convertHeicToJpeg = vi.fn(async () => ({ path: '/tmp/photo.jpg' }));
  fake.plugin.copyFile = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({
    accessMediaLocation: 'granted',
    readExternalStorage: 'granted',
  }));
  fake.plugin.requestPermissions = vi.fn(async () => ({
    accessMediaLocation: 'granted',
    readExternalStorage: 'granted',
  }));
  return { FilePicker: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FilePicker as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/file-picker', () => {
  it('useFilePicker exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFilePicker(), { wrapper: StrictModeWrapper });
    await expect(result.current.pickFiles()).resolves.toEqual({ files: [{ name: 'report.pdf' }] });
    await expect(result.current.pickDirectory()).resolves.toEqual({ path: '/tmp' });
  });

  it('useFilePickerPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useFilePickerPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() =>
      expect(result.current.status).toEqual({
        accessMediaLocation: 'granted',
        readExternalStorage: 'granted',
      }),
    );
  });

  it('useFilePickerDismissed delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFilePickerDismissed(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('pickerDismissed'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('pickerDismissed')).toBe(0);
  });
});
