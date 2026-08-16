import { PoseDetection } from '@capacitor-mlkit/pose-detection';
import { renderHook } from '@testing-library/react';

import { usePoseDetection } from '../../src/mlkit/pose-detection';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/pose-detection', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({ poses: [] }));
  return { PoseDetection: fake.plugin };
});

describe('mlkit/pose-detection', () => {
  it('usePoseDetection exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePoseDetection(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      poses: [],
    });
    expect(PoseDetection.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
  });
});
