import { Device } from '@capacitor/device';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useBatteryInfo, useDevice } from '../../src/capacitor/device';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/device', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getId = vi.fn(async () => ({ identifier: 'device-id' }));
  fake.plugin.getInfo = vi.fn(async () => ({ model: 'iPhone13,4', platform: 'ios' }));
  fake.plugin.getBatteryInfo = vi.fn(async () => ({ batteryLevel: 0.8, isCharging: false }));
  fake.plugin.getLanguageCode = vi.fn(async () => ({ value: 'en' }));
  fake.plugin.getLanguageTag = vi.fn(async () => ({ value: 'en-US' }));
  return { Device: fake.plugin };
});

const getBatteryInfo = vi.mocked(Device.getBatteryInfo);
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/device', () => {
  beforeEach(() => getBatteryInfo.mockClear());
  afterEach(() => vi.useRealTimers());

  it('useBatteryInfo fetches the battery info on mount', async () => {
    const { result } = renderHook(() => useBatteryInfo(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toEqual({ batteryLevel: 0.8, isCharging: false }));
  });

  it('useBatteryInfo does not poll without a poll interval', async () => {
    vi.useFakeTimers();
    renderHook(() => useBatteryInfo());
    await flushMicrotasks();
    expect(getBatteryInfo).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10_000));
    await flushMicrotasks();
    expect(getBatteryInfo).toHaveBeenCalledTimes(1);
  });

  it('useBatteryInfo refetches on the poll interval and stops on unmount', async () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useBatteryInfo({ pollInterval: 1000 }));
    await flushMicrotasks();
    expect(getBatteryInfo).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(2000));
    await flushMicrotasks();
    expect(getBatteryInfo).toHaveBeenCalledTimes(3);

    unmount();
    act(() => vi.advanceTimersByTime(5000));
    await flushMicrotasks();
    expect(getBatteryInfo).toHaveBeenCalledTimes(3);
  });

  it('useDevice exposes the plugin methods', async () => {
    const { result } = renderHook(() => useDevice(), { wrapper: StrictModeWrapper });
    await expect(result.current.getId()).resolves.toEqual({ identifier: 'device-id' });
    await expect(result.current.getLanguageTag()).resolves.toEqual({ value: 'en-US' });
  });
});
