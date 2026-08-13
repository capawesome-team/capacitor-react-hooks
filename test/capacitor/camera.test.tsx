import { Camera } from '@capacitor/camera';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useCamera, useCameraPermissions } from '../../src/capacitor/camera';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/camera', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.takePhoto = vi.fn(async () => ({ path: '/data/photo.jpg' }));
  fake.plugin.recordVideo = vi.fn(async () => ({ path: '/data/video.mp4' }));
  fake.plugin.playVideo = vi.fn(async () => undefined);
  fake.plugin.chooseFromGallery = vi.fn(async () => ({ results: [] }));
  fake.plugin.editPhoto = vi.fn(async () => ({ base64String: 'ZWRpdGVk' }));
  fake.plugin.editURIPhoto = vi.fn(async () => ({ path: '/data/edited.jpg' }));
  fake.plugin.pickLimitedLibraryPhotos = vi.fn(async () => ({ photos: [] }));
  fake.plugin.getLimitedLibraryPhotos = vi.fn(async () => ({ photos: [] }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ camera: 'granted', photos: 'limited' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ camera: 'granted', photos: 'granted' }));
  return { Camera: fake.plugin };
});

describe('capacitor/camera', () => {
  it('useCameraPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useCameraPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() =>
      expect(result.current.status).toEqual({ camera: 'granted', photos: 'limited' }),
    );
  });

  it('useCameraPermissions requests the given permissions', async () => {
    const { result } = renderHook(() => useCameraPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toBeDefined());
    await act(() => result.current.request({ permissions: ['photos'] }));
    expect(Camera.requestPermissions).toHaveBeenCalledWith({ permissions: ['photos'] });
    expect(result.current.status).toEqual({ camera: 'granted', photos: 'granted' });
  });

  it('useCamera exposes the plugin methods', async () => {
    const { result } = renderHook(() => useCamera(), { wrapper: StrictModeWrapper });
    await expect(result.current.takePhoto({})).resolves.toEqual({ path: '/data/photo.jpg' });
    await expect(result.current.chooseFromGallery({})).resolves.toEqual({ results: [] });
    await expect(result.current.getLimitedLibraryPhotos()).resolves.toEqual({ photos: [] });
    expect(typeof result.current.playVideo).toBe('function');
    expect(typeof result.current.editPhoto).toBe('function');
    expect(typeof result.current.editURIPhoto).toBe('function');
    expect(typeof result.current.pickLimitedLibraryPhotos).toBe('function');
  });

  it('useCamera omits the deprecated methods', () => {
    const { result } = renderHook(() => useCamera(), { wrapper: StrictModeWrapper });
    expect(result.current).not.toHaveProperty('getPhoto');
    expect(result.current).not.toHaveProperty('pickImages');
  });
});
