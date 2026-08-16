import { SelfieSegmentation } from '@capacitor-mlkit/selfie-segmentation';
import { renderHook } from '@testing-library/react';

import { useSelfieSegmentation } from '../../src/mlkit/selfie-segmentation';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/selfie-segmentation', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({
    path: 'segmented.png',
    width: 1080,
    height: 1920,
  }));
  return { SelfieSegmentation: fake.plugin };
});

describe('mlkit/selfie-segmentation', () => {
  it('useSelfieSegmentation exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSelfieSegmentation(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      path: 'segmented.png',
      width: 1080,
      height: 1920,
    });
    expect(SelfieSegmentation.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
  });
});
