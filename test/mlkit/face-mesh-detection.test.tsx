import { FaceMeshDetection } from '@capacitor-mlkit/face-mesh-detection';
import { renderHook } from '@testing-library/react';

import { useFaceMeshDetection } from '../../src/mlkit/face-mesh-detection';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/face-mesh-detection', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({ faceMeshs: [] }));
  return { FaceMeshDetection: fake.plugin };
});

describe('mlkit/face-mesh-detection', () => {
  it('useFaceMeshDetection exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFaceMeshDetection(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      faceMeshs: [],
    });
    expect(FaceMeshDetection.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
  });
});
