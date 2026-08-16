import { ObjectDetection } from '@capacitor-mlkit/object-detection';
import { renderHook } from '@testing-library/react';

import { useObjectDetection } from '../../src/mlkit/object-detection';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/object-detection', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({ detectedObjects: [] }));
  return { ObjectDetection: fake.plugin };
});

describe('mlkit/object-detection', () => {
  it('useObjectDetection exposes the plugin methods', async () => {
    const { result } = renderHook(() => useObjectDetection(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.processImage({ path: 'image.jpg', shouldEnableClassification: true }),
    ).resolves.toEqual({ detectedObjects: [] });
    expect(ObjectDetection.processImage).toHaveBeenCalledWith({
      path: 'image.jpg',
      shouldEnableClassification: true,
    });
  });
});
