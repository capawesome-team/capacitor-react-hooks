import { renderHook } from '@testing-library/react';

import { useEdgeToEdge } from '../../src/capawesome/android-edge-to-edge-support';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-android-edge-to-edge-support', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.enable = vi.fn(async () => undefined);
  fake.plugin.disable = vi.fn(async () => undefined);
  fake.plugin.getInsets = vi.fn(async () => ({ bottom: 48, left: 0, right: 0, top: 24 }));
  fake.plugin.setStatusBarColor = vi.fn(async () => undefined);
  fake.plugin.setNavigationBarColor = vi.fn(async () => undefined);
  return { EdgeToEdge: fake.plugin };
});

describe('capawesome/android-edge-to-edge-support', () => {
  it('useEdgeToEdge exposes the plugin methods', async () => {
    const { result } = renderHook(() => useEdgeToEdge(), { wrapper: StrictModeWrapper });
    await expect(result.current.getInsets()).resolves.toEqual({
      bottom: 48,
      left: 0,
      right: 0,
      top: 24,
    });
    await expect(result.current.enable()).resolves.toBeUndefined();
    await expect(result.current.setStatusBarColor({ color: '#ffffff' })).resolves.toBeUndefined();
  });
});
