import { BackgroundGeolocation } from '@capawesome-team/capacitor-background-geolocation';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBackgroundGeolocation,
  useBackgroundGeolocationPermissions,
  useBackgroundGeolocationPositionChange,
  useBackgroundGeolocationWatchSession,
} from '../../src/capawesome/background-geolocation';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-background-geolocation', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCurrentPosition = vi.fn(async () => ({ position: { latitude: 1, longitude: 2 } }));
  fake.plugin.isWatching = vi.fn(async () => ({ watching: false }));
  fake.plugin.startWatching = vi.fn(async () => undefined);
  fake.plugin.stopWatching = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({
    backgroundLocation: 'prompt',
    location: 'prompt',
    notifications: 'prompt',
  }));
  fake.plugin.requestPermissions = vi.fn(async () => ({
    backgroundLocation: 'prompt',
    location: 'granted',
    notifications: 'granted',
  }));
  return { BackgroundGeolocation: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (BackgroundGeolocation as unknown as { __fake: FakePlugin }).__fake;
const startWatching = vi.mocked(BackgroundGeolocation.startWatching);
const stopWatching = vi.mocked(BackgroundGeolocation.stopWatching);

const flushMicrotasks = () => act(() => Promise.resolve());
const position = { accuracy: 5, latitude: 48.7758459, longitude: 9.1829321, timestamp: 1 };

describe('capawesome/background-geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBackgroundGeolocation exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBackgroundGeolocation(), {
      wrapper: StrictModeWrapper,
    });
    await expect(result.current.getCurrentPosition()).resolves.toEqual({
      position: { latitude: 1, longitude: 2 },
    });
    await expect(result.current.isWatching()).resolves.toEqual({ watching: false });
  });

  it('useBackgroundGeolocationPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useBackgroundGeolocationPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status?.location).toBe('prompt'));

    await act(() => result.current.request());
    expect(result.current.status?.location).toBe('granted');
  });

  it('useBackgroundGeolocationWatchSession starts watching and collects positions', async () => {
    const options = { distanceFilter: 10 };
    const { result } = renderHook(() => useBackgroundGeolocationWatchSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isWatching).toBe(false);
    expect(fake.listenerCount('positionChange')).toBe(0);

    await act(() => result.current.start(options));
    await flushMicrotasks();
    expect(startWatching).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isWatching).toBe(true);
    expect(fake.listenerCount('positionChange')).toBe(1);

    act(() => fake.emit('positionChange', { position }));
    expect(result.current.position).toEqual(position);
  });

  it('useBackgroundGeolocationWatchSession exposes errors of the running session', async () => {
    const { result } = renderHook(() => useBackgroundGeolocationWatchSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    const error = {
      code: 'LOCATION_SERVICES_DISABLED',
      message: 'Location services are disabled.',
    };
    act(() => fake.emit('positionError', error));
    expect(result.current.error).toEqual(error);
  });

  it('useBackgroundGeolocationWatchSession stops watching and detaches the listeners on stop', async () => {
    const { result } = renderHook(() => useBackgroundGeolocationWatchSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    await act(() => result.current.stop());
    await flushMicrotasks();
    expect(stopWatching).toHaveBeenCalledOnce();
    expect(result.current.isWatching).toBe(false);
    expect(fake.listenerCount('positionChange')).toBe(0);
    expect(fake.listenerCount('positionError')).toBe(0);
  });

  it('useBackgroundGeolocationWatchSession stops watching on unmount', async () => {
    const { result, unmount } = renderHook(() => useBackgroundGeolocationWatchSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopWatching).toHaveBeenCalledOnce();
    expect(fake.listenerCount('positionChange')).toBe(0);
  });

  it('useBackgroundGeolocationWatchSession does not stop a session that was never started', async () => {
    const { unmount } = renderHook(() => useBackgroundGeolocationWatchSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopWatching).not.toHaveBeenCalled();
  });

  it('useBackgroundGeolocationPositionChange delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBackgroundGeolocationPositionChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('positionChange', { position }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ position });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('positionChange')).toBe(0);
  });
});
