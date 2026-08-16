import { Barometer } from '@capawesome-team/capacitor-barometer';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBarometer,
  useBarometerMeasurement,
  useBarometerPermissions,
  useBarometerUpdates,
} from '../../src/capawesome/barometer';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-barometer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMeasurement = vi.fn(async () => ({ pressure: 1013.25, timestamp: 1748874591694 }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.startMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.stopMeasurementUpdates = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ barometer: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ barometer: 'granted' }));
  return { Barometer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Barometer as unknown as { __fake: FakePlugin }).__fake;
const startMeasurementUpdates = vi.mocked(Barometer.startMeasurementUpdates);
const stopMeasurementUpdates = vi.mocked(Barometer.stopMeasurementUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const measurement = { pressure: 1005.4, relativeAltitude: 12.5, timestamp: 1748874591700 };

describe('capawesome/barometer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBarometerMeasurement delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBarometerMeasurement(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('measurement', measurement));
    expect(callback).toHaveBeenCalledExactlyOnceWith(measurement);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useBarometerUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBarometerUpdates(callback), {
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

  it('useBarometerUpdates does not start the updates when disabled', async () => {
    renderHook(() => useBarometerUpdates(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startMeasurementUpdates).not.toHaveBeenCalled();
    expect(fake.listenerCount('measurement')).toBe(0);
  });

  it('useBarometerPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useBarometerPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ barometer: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ barometer: 'granted' });
  });

  it('useBarometer exposes getMeasurement', async () => {
    const { result } = renderHook(() => useBarometer(), { wrapper: StrictModeWrapper });
    await expect(result.current.getMeasurement()).resolves.toEqual({
      pressure: 1013.25,
      timestamp: 1748874591694,
    });
  });
});
