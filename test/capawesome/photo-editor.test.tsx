import { PhotoEditor } from '@capawesome/capacitor-photo-editor';
import { renderHook } from '@testing-library/react';

import { usePhotoEditor } from '../../src/capawesome/photo-editor';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-photo-editor', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.editPhoto = vi.fn(async () => undefined);
  return { PhotoEditor: fake.plugin };
});

describe('capawesome/photo-editor', () => {
  it('usePhotoEditor exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePhotoEditor(), { wrapper: StrictModeWrapper });
    await expect(result.current.editPhoto({ path: '/tmp/photo.jpg' })).resolves.toBeUndefined();
    expect(PhotoEditor.editPhoto).toHaveBeenCalledWith({ path: '/tmp/photo.jpg' });
  });
});
