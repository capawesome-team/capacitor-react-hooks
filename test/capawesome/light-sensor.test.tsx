import { LightSensor } from '@capawesome/capacitor-light-sensor';
import { act, renderHook } from '@testing-library/react';

import {
  useLightSensor,
  useLightSensorMeasurement,
  useLightSensorUpdates,
} from '../../src/capawesome/light-sensor';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-light-sensor', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({ illuminance: 320 }));
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  return { LightSensor: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (LightSensor as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(LightSensor.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(LightSensor.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/light-sensor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useLightSensorMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLightSensorMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', { illuminance: 42 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ illuminance: 42 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useLightSensorUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLightSensorUpdates(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startMeasurementUpdates).toHaveBeenCalled();
    expect(fake.listenerCount('measurement')).toBe(1);
    act(() => fake.emit('measurement', { illuminance: 42 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ illuminance: 42 });

    unmount();
    await flushMicrotasks();
    expect(stopMeasurementUpdates).toHaveBeenCalledTimes(startMeasurementUpdates.mock.calls.length);
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useLightSensor exposes getMeasurement', async () => {
    const { result } = renderHook(() => useLightSensor(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({ illuminance: 320 });
  });
});
