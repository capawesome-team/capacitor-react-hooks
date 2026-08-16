import { Pedometer } from '@capawesome-team/capacitor-pedometer';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  usePedometer,
  usePedometerMeasurement,
  usePedometerPermissions,
  usePedometerUpdates,
} from '../../src/capawesome/pedometer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-pedometer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({
    end: 1748874591694,
    numberOfSteps: 1234,
    start: 1748870000000,
  }));
  fake.plugin.isAvailable = vi.fn(async () => ({
    cadence: false,
    distance: false,
    floorCounting: false,
    pace: false,
    stepCounting: true,
  }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ activityRecognition: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ activityRecognition: 'granted' }));
  return { Pedometer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Pedometer as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(Pedometer.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(Pedometer.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const measurement = { end: 1748874591700, numberOfSteps: 42, start: 1748870000000 };

describe('capawesome/pedometer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usePedometerMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePedometerMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('usePedometerUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePedometerUpdates(callback), {
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

  it('usePedometerUpdates does not start the updates when disabled', async () => {
    renderHook(() => usePedometerUpdates(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startMeasurementUpdates).not.toHaveBeenCalled();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('usePedometerPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => usePedometerPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ activityRecognition: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ activityRecognition: 'granted' });
  });

  it('usePedometer exposes getMeasurement', async () => {
    const { result } = renderHook(() => usePedometer(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({
      end: 1748874591694,
      numberOfSteps: 1234,
      start: 1748870000000,
    });
  });
});
