import { Network } from '@capacitor/network';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useNetwork, useNetworkStatus, useNetworkStatusChange } from '../../src/capacitor/network';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/network', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getStatus = vi.fn(async () => ({ connected: true, connectionType: 'wifi' }));
  return { Network: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Network as unknown as { __fake: FakePlugin }).__fake;

describe('capacitor/network', () => {
  it('useNetworkStatus seeds from getStatus and follows change events', async () => {
    const { result } = renderHook(() => useNetworkStatus(), { wrapper: StrictModeWrapper });
    await waitFor(() =>
      expect(result.current).toEqual({ connected: true, connectionType: 'wifi' }),
    );
    act(() => fake.emit('networkStatusChange', { connected: false, connectionType: 'none' }));
    expect(result.current).toEqual({ connected: false, connectionType: 'none' });
  });

  it('useNetworkStatusChange delivers change events', async () => {
    const callback = vi.fn();
    renderHook(() => useNetworkStatusChange(callback), { wrapper: StrictModeWrapper });
    await act(() => Promise.resolve());
    act(() => fake.emit('networkStatusChange', { connected: true, connectionType: 'cellular' }));
    expect(callback).toHaveBeenCalledWith({ connected: true, connectionType: 'cellular' });
  });

  it('useNetwork exposes getStatus', async () => {
    const { result } = renderHook(() => useNetwork(), { wrapper: StrictModeWrapper });
    await expect(result.current.getStatus()).resolves.toEqual({
      connected: true,
      connectionType: 'wifi',
    });
  });
});
