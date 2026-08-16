import { Wifi } from '@capawesome-team/capacitor-wifi';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useWifi,
  useWifiAvailableNetworks,
  useWifiNetworksScanned,
  useWifiPermissions,
} from '../../src/capawesome/wifi';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-wifi', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAvailableNetworks = vi.fn(async () => ({
    networks: [{ rssi: -50, ssid: 'Capawesome' }],
  }));
  fake.plugin.getSsid = vi.fn(async () => ({ ssid: 'Capawesome' }));
  fake.plugin.isEnabled = vi.fn(async () => ({ enabled: true }));
  fake.plugin.startScan = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ location: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ location: 'granted' }));
  return { Wifi: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Wifi as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/wifi', () => {
  it('useWifi exposes the plugin methods', async () => {
    const { result } = renderHook(() => useWifi(), { wrapper: StrictModeWrapper });
    await expect(result.current.getSsid()).resolves.toEqual({ ssid: 'Capawesome' });
    expect(Wifi.getSsid).toHaveBeenCalled();
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: true });
    await expect(result.current.startScan()).resolves.toBeUndefined();
  });

  it('useWifiPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useWifiPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ location: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ location: 'granted' });
  });

  it('useWifiAvailableNetworks seeds from getAvailableNetworks and follows networksScanned', async () => {
    const { result } = renderHook(() => useWifiAvailableNetworks(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toEqual([{ rssi: -50, ssid: 'Capawesome' }]));

    const networks = [{ rssi: -70, ssid: 'Capacitor' }];
    act(() => fake.emit('networksScanned', { networks }));
    expect(result.current).toEqual(networks);
  });

  it('useWifiNetworksScanned delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useWifiNetworksScanned(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { networks: [{ rssi: -60, ssid: 'Capawesome' }] };
    act(() => fake.emit('networksScanned', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('networksScanned')).toBe(0);
  });
});
