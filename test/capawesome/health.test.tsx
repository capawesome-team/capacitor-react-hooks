import { Health } from '@capawesome-team/capacitor-health';
import { renderHook } from '@testing-library/react';

import { useHealth } from '../../src/capawesome/health';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-health', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true, reason: null }));
  fake.plugin.openSettings = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ permissions: [] }));
  return { Health: Object.assign(fake.plugin, { __fake: fake }) };
});

describe('capawesome/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useHealth exposes the plugin methods', async () => {
    const { result } = renderHook(() => useHealth(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true, reason: null });
    expect(Health.isAvailable).toHaveBeenCalled();
    await expect(result.current.openSettings()).resolves.toBeUndefined();
  });

  it('useHealth exposes checkPermissions, which takes the data types to check', async () => {
    const { result } = renderHook(() => useHealth(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkPermissions({ read: [] })).resolves.toEqual({
      permissions: [],
    });
    expect(Health.checkPermissions).toHaveBeenCalledExactlyOnceWith({ read: [] });
  });
});
