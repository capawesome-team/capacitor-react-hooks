import { ImageLabeling } from '@capacitor-mlkit/image-labeling';
import { renderHook } from '@testing-library/react';

import { useImageLabeling } from '../../src/mlkit/image-labeling';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/image-labeling', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({
    labels: [{ text: 'Coffee', confidence: 0.9, index: 0 }],
  }));
  return { ImageLabeling: fake.plugin };
});

describe('mlkit/image-labeling', () => {
  it('useImageLabeling exposes the plugin methods', async () => {
    const { result } = renderHook(() => useImageLabeling(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.processImage({ path: 'image.jpg', confidenceThreshold: 0.5 }),
    ).resolves.toEqual({ labels: [{ text: 'Coffee', confidence: 0.9, index: 0 }] });
    expect(ImageLabeling.processImage).toHaveBeenCalledWith({
      path: 'image.jpg',
      confidenceThreshold: 0.5,
    });
  });
});
