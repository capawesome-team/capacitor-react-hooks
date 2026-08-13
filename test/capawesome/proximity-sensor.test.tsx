import { ProximitySensor } from '@capawesome/capacitor-proximity-sensor';
import { act, renderHook } from '@testing-library/react';

import {
  useProximitySensor,
  useProximitySensorMeasurement,
  useProximitySensorUpdates,
} from '../../src/capawesome/proximity-sensor';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-proximity-sensor', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({ distance: 5, near: false }));
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  return { ProximitySensor: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ProximitySensor as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(ProximitySensor.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(ProximitySensor.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const measurement = { distance: 0, near: true };

describe('capawesome/proximity-sensor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useProximitySensorMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useProximitySensorMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useProximitySensorUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useProximitySensorUpdates(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startMeasurementUpdates).toHaveBeenCalled();
    expect(fake.listenerCount('measurement')).toBe(1);
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(stopMeasurementUpdates).toHaveBeenCalledTimes(startMeasurementUpdates.mock.calls.length);
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useProximitySensor exposes getMeasurement', async () => {
    const { result } = renderHook(() => useProximitySensor(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({ distance: 5, near: false });
  });
});
