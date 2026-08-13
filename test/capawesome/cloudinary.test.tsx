import { Cloudinary, ResourceType } from '@capawesome/capacitor-cloudinary';
import { renderHook } from '@testing-library/react';

import { useCloudinary } from '../../src/capawesome/cloudinary';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-cloudinary', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.uploadResource = vi.fn(async () => ({ url: 'https://res.cloudinary.com/demo.jpg' }));
  fake.plugin.downloadResource = vi.fn(async () => ({ path: '/tmp/demo.jpg' }));
  return { Cloudinary: fake.plugin, ResourceType: { Image: 'image', Video: 'video', Raw: 'raw' } };
});

describe('capawesome/cloudinary', () => {
  it('useCloudinary exposes the plugin methods', async () => {
    const { result } = renderHook(() => useCloudinary(), { wrapper: StrictModeWrapper });
    await expect(result.current.initialize({ cloudName: 'demo' })).resolves.toBeUndefined();
    expect(Cloudinary.initialize).toHaveBeenCalledWith({ cloudName: 'demo' });
    await expect(
      result.current.uploadResource({
        path: '/tmp/demo.jpg',
        resourceType: ResourceType.Image,
        uploadPreset: 'preset',
      }),
    ).resolves.toEqual({ url: 'https://res.cloudinary.com/demo.jpg' });
    await expect(
      result.current.downloadResource({ url: 'https://res.cloudinary.com/demo.jpg' }),
    ).resolves.toEqual({ path: '/tmp/demo.jpg' });
  });
});
