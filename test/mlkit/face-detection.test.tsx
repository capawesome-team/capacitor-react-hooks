import { FaceDetection } from '@capacitor-mlkit/face-detection';
import { renderHook } from '@testing-library/react';

import { useFaceDetection } from '../../src/mlkit/face-detection';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/face-detection', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({ faces: [] }));
  return { FaceDetection: fake.plugin };
});

describe('mlkit/face-detection', () => {
  it('useFaceDetection exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFaceDetection(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      faces: [],
    });
    expect(FaceDetection.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
  });
});
