import { Network } from '@capawesome/capacitor-network';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useNetwork, useNetworkStatus, useNetworkStatusChange } from '../../src/capawesome/network';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const connectedStatus = {
  connected: true,
  connectionType: 'WIFI',
  internetReachable: true,
  constrained: false,
  expensive: false,
  ultraConstrained: false,
};
const disconnectedStatus = {
  connected: false,
  connectionType: 'NONE',
  internetReachable: false,
  constrained: false,
  expensive: false,
  ultraConstrained: false,
};

vi.mock('@capawesome/capacitor-network', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getStatus = vi.fn(async () => ({
    connected: true,
    connectionType: 'WIFI',
    internetReachable: true,
    constrained: false,
    expensive: false,
    ultraConstrained: false,
  }));
  fake.plugin.isAirplaneModeEnabled = vi.fn(async () => ({ enabled: false }));
  return { Network: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Network as unknown as { __fake: FakePlugin }).__fake;

describe('capawesome/network', () => {
  it('useNetworkStatus seeds from getStatus and follows change events', async () => {
    const { result } = renderHook(() => useNetworkStatus(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toEqual(connectedStatus));
    act(() => fake.emit('networkStatusChange', disconnectedStatus));
    expect(result.current).toEqual(disconnectedStatus);
  });

  it('useNetworkStatusChange delivers change events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useNetworkStatusChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await act(() => Promise.resolve());
    act(() => fake.emit('networkStatusChange', disconnectedStatus));
    expect(callback).toHaveBeenCalledExactlyOnceWith(disconnectedStatus);
    unmount();
    expect(fake.listenerCount('networkStatusChange')).toBe(0);
  });

  it('useNetwork exposes the plugin methods', async () => {
    const { result } = renderHook(() => useNetwork(), { wrapper: StrictModeWrapper });
    await expect(result.current.getStatus()).resolves.toEqual(connectedStatus);
    await expect(result.current.isAirplaneModeEnabled()).resolves.toEqual({ enabled: false });
  });
});
