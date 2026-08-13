import { Exif } from '@capawesome/capacitor-exif';
import { renderHook } from '@testing-library/react';

import { useExif } from '../../src/capawesome/exif';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-exif', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.readExif = vi.fn(async () => ({ tags: { make: 'Apple' } }));
  fake.plugin.removeExif = vi.fn(async () => undefined);
  fake.plugin.writeExif = vi.fn(async () => undefined);
  return { Exif: fake.plugin };
});

describe('capawesome/exif', () => {
  it('useExif exposes the plugin methods', async () => {
    const { result } = renderHook(() => useExif(), { wrapper: StrictModeWrapper });
    await expect(result.current.readExif({ path: '/tmp/photo.jpg' })).resolves.toEqual({
      tags: { make: 'Apple' },
    });
    await expect(result.current.removeExif({ path: '/tmp/photo.jpg' })).resolves.toBeUndefined();
    await expect(
      result.current.writeExif({ path: '/tmp/photo.jpg', tags: { make: 'Apple' } }),
    ).resolves.toBeUndefined();
    expect(Exif.writeExif).toHaveBeenCalledWith({
      path: '/tmp/photo.jpg',
      tags: { make: 'Apple' },
    });
  });
});
