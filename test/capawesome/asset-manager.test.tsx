import { renderHook } from '@testing-library/react';

import { useAssetManager } from '../../src/capawesome/asset-manager';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-asset-manager', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.copy = vi.fn(async () => undefined);
  fake.plugin.list = vi.fn(async () => ({ files: ['public/index.html'] }));
  fake.plugin.read = vi.fn(async () => ({ data: 'SGVsbG8=' }));
  return { AssetManager: fake.plugin };
});

describe('capawesome/asset-manager', () => {
  it('useAssetManager exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAssetManager(), { wrapper: StrictModeWrapper });
    await expect(result.current.list({ path: 'public' })).resolves.toEqual({
      files: ['public/index.html'],
    });
    await expect(result.current.read({ path: 'public/index.html' })).resolves.toEqual({
      data: 'SGVsbG8=',
    });
    await expect(
      result.current.copy({ from: 'public/index.html', to: '/tmp/index.html' }),
    ).resolves.toBeUndefined();
  });
});
