import { TextRecognition } from '@capacitor-mlkit/text-recognition';
import { renderHook } from '@testing-library/react';

import { useTextRecognition } from '../../src/mlkit/text-recognition';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/text-recognition', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({ text: 'CapacitorJS', blocks: [] }));
  return { TextRecognition: fake.plugin };
});

describe('mlkit/text-recognition', () => {
  it('useTextRecognition exposes the plugin methods', async () => {
    const { result } = renderHook(() => useTextRecognition(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      text: 'CapacitorJS',
      blocks: [],
    });
    expect(TextRecognition.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
  });
});
