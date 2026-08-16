import { Accelerometer } from '@capawesome-team/capacitor-accelerometer';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useAccelerometer,
  useAccelerometerMeasurement,
  useAccelerometerPermissions,
  useAccelerometerUpdates,
} from '../../src/capawesome/accelerometer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-accelerometer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({ x: 0.1, y: 0.2, z: 0.98 }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ accelerometer: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ accelerometer: 'granted' }));
  return { Accelerometer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Accelerometer as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(Accelerometer.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(Accelerometer.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const measurement = { x: 1, y: 2, z: 3 };

describe('capawesome/accelerometer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAccelerometerMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAccelerometerMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useAccelerometerUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAccelerometerUpdates(callback), {
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

  it('useAccelerometerUpdates does not start the updates when disabled', async () => {
    renderHook(() => useAccelerometerUpdates(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startMeasurementUpdates).not.toHaveBeenCalled();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useAccelerometerPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useAccelerometerPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ accelerometer: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ accelerometer: 'granted' });
  });

  it('useAccelerometer exposes getMeasurement', async () => {
    const { result } = renderHook(() => useAccelerometer(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({ x: 0.1, y: 0.2, z: 0.98 });
  });
});
