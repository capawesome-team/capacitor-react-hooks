import { Badge } from '@capawesome/capacitor-badge';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useBadge, useBadgePermissions } from '../../src/capawesome/badge';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-badge', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.get = vi.fn(async () => ({ count: 3 }));
  fake.plugin.set = vi.fn(async () => undefined);
  fake.plugin.increase = vi.fn(async () => undefined);
  fake.plugin.decrease = vi.fn(async () => undefined);
  fake.plugin.clear = vi.fn(async () => undefined);
  fake.plugin.isSupported = vi.fn(async () => ({ isSupported: true }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ display: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ display: 'granted' }));
  return { Badge: fake.plugin };
});

describe('capawesome/badge', () => {
  it('useBadge exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBadge(), { wrapper: StrictModeWrapper });
    await expect(result.current.get()).resolves.toEqual({ count: 3 });
    await expect(result.current.isSupported()).resolves.toEqual({ isSupported: true });
    await act(() => result.current.set({ count: 5 }));
    expect(Badge.set).toHaveBeenCalledWith({ count: 5 });
    expect(typeof result.current.increase).toBe('function');
    expect(typeof result.current.decrease).toBe('function');
    expect(typeof result.current.clear).toBe('function');
  });

  it('useBadgePermissions checks on mount and requests on demand', async () => {
    const { result } = renderHook(() => useBadgePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ display: 'prompt' }));
    await act(() => result.current.request());
    expect(result.current.status).toEqual({ display: 'granted' });
  });
});
