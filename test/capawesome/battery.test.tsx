import { Battery } from '@capawesome/capacitor-battery';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBattery,
  useBatteryLevel,
  useBatteryLevelChange,
  useBatteryState,
  useIsLowPowerModeEnabled,
} from '../../src/capawesome/battery';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-battery', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getBatteryLevel = vi.fn(async () => ({ level: 0.75 }));
  fake.plugin.getBatteryState = vi.fn(async () => ({ state: 'charging' }));
  fake.plugin.isLowPowerModeEnabled = vi.fn(async () => ({ enabled: false }));
  return { Battery: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Battery as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/battery', () => {
  it('useBatteryLevel seeds from getBatteryLevel and follows change events', async () => {
    const { result } = renderHook(() => useBatteryLevel(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(0.75));
    act(() => fake.emit('batteryLevelChange', { level: 0.25 }));
    expect(result.current).toBe(0.25);
  });

  it('useBatteryState seeds from getBatteryState and follows change events', async () => {
    const { result } = renderHook(() => useBatteryState(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe('charging'));
    act(() => fake.emit('batteryStateChange', { state: 'unplugged' }));
    expect(result.current).toBe('unplugged');
  });

  it('useIsLowPowerModeEnabled seeds from isLowPowerModeEnabled and follows change events', async () => {
    const { result } = renderHook(() => useIsLowPowerModeEnabled(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toBe(false));
    act(() => fake.emit('lowPowerModeChange', { enabled: true }));
    expect(result.current).toBe(true);
  });

  it('useBatteryLevelChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBatteryLevelChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('batteryLevelChange', { level: 0.5 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ level: 0.5 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('batteryLevelChange')).toBe(0);
  });

  it('useBattery exposes getBatteryLevel', async () => {
    const { result } = renderHook(() => useBattery(), { wrapper: StrictModeWrapper });
    await expect(result.current.getBatteryLevel()).resolves.toEqual({ level: 0.75 });
  });
});
