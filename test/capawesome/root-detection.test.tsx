import { renderHook } from '@testing-library/react';

import { useRootDetection } from '../../src/capawesome/root-detection';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-root-detection', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isDeveloperModeEnabled = vi.fn(async () => ({ enabled: true }));
  fake.plugin.isEmulator = vi.fn(async () => ({ emulator: false }));
  fake.plugin.isRooted = vi.fn(async () => ({ rooted: false }));
  return { RootDetection: fake.plugin };
});

describe('capawesome/root-detection', () => {
  it('useRootDetection exposes the plugin methods', async () => {
    const { result } = renderHook(() => useRootDetection(), { wrapper: StrictModeWrapper });
    await expect(result.current.isDeveloperModeEnabled()).resolves.toEqual({ enabled: true });
    await expect(result.current.isEmulator()).resolves.toEqual({ emulator: false });
    await expect(result.current.isRooted()).resolves.toEqual({ rooted: false });
  });
});
