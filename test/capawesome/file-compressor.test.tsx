import { FileCompressor } from '@capawesome-team/capacitor-file-compressor';
import { renderHook } from '@testing-library/react';

import { useFileCompressor } from '../../src/capawesome/file-compressor';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-file-compressor', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.compressImage = vi.fn(async () => ({ path: 'file:///compressed.jpg' }));
  return { FileCompressor: fake.plugin };
});

describe('capawesome/file-compressor', () => {
  it('useFileCompressor exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFileCompressor(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.compressImage({ path: 'file:///image.jpg', quality: 0.5 }),
    ).resolves.toEqual({
      path: 'file:///compressed.jpg',
    });
    expect(FileCompressor.compressImage).toHaveBeenCalledWith({
      path: 'file:///image.jpg',
      quality: 0.5,
    });
  });

  it('useFileCompressor keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useFileCompressor(), {
      wrapper: StrictModeWrapper,
    });
    const { compressImage } = result.current;
    rerender();
    expect(result.current.compressImage).toBe(compressImage);
  });
});
