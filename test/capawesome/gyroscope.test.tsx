import { Gyroscope } from '@capawesome/capacitor-gyroscope';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useGyroscope,
  useGyroscopeMeasurement,
  useGyroscopePermissions,
  useGyroscopeUpdates,
} from '../../src/capawesome/gyroscope';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-gyroscope', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({ x: 0.1, y: 0.2, z: 0.3 }));
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ gyroscope: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ gyroscope: 'granted' }));
  return { Gyroscope: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Gyroscope as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(Gyroscope.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(Gyroscope.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const measurement = { x: 1, y: 2, z: 3 };

describe('capawesome/gyroscope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGyroscopeMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGyroscopeMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useGyroscopeUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGyroscopeUpdates(callback), {
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

  it('useGyroscopePermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useGyroscopePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ gyroscope: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ gyroscope: 'granted' });
  });

  it('useGyroscope exposes getMeasurement', async () => {
    const { result } = renderHook(() => useGyroscope(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({ x: 0.1, y: 0.2, z: 0.3 });
  });
});
