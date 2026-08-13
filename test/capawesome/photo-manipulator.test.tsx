import { renderHook } from '@testing-library/react';

import { usePhotoManipulator } from '../../src/capawesome/photo-manipulator';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-photo-manipulator', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getInfo = vi.fn(async () => ({ width: 640, height: 480, format: 'jpeg' }));
  fake.plugin.transform = vi.fn(async () => ({ path: '/tmp/transformed.jpg' }));
  return { PhotoManipulator: fake.plugin };
});

describe('capawesome/photo-manipulator', () => {
  it('usePhotoManipulator exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePhotoManipulator(), { wrapper: StrictModeWrapper });
    await expect(result.current.getInfo({ path: '/tmp/photo.jpg' })).resolves.toEqual({
      width: 640,
      height: 480,
      format: 'jpeg',
    });
    await expect(result.current.transform({ path: '/tmp/photo.jpg' })).resolves.toEqual({
      path: '/tmp/transformed.jpg',
    });
  });
});
