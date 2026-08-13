import type { Position, PositionOptions, WatchPositionCallback } from '@capacitor/geolocation';
import { Geolocation } from '@capacitor/geolocation';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useGeolocation,
  useGeolocationPermissions,
  useWatchPosition,
} from '../../src/capacitor/geolocation';
import { StrictModeWrapper } from '../strict-mode';

interface FakeGeolocation {
  watchers: Map<string, WatchPositionCallback>;
  createPosition(latitude: number): Position;
  emit(position: Position | null, error?: unknown): void;
  deferIds(defer: boolean): void;
  flushIds(): void;
  reset(): void;
}

vi.mock('@capacitor/geolocation', () => {
  const watchers = new Map<string, WatchPositionCallback>();
  const pendingIds: (() => void)[] = [];
  let nextId = 0;
  let deferred = false;
  const createPosition = (latitude: number): Position => ({
    timestamp: 1700000000000,
    coords: {
      latitude,
      longitude: 11.58,
      accuracy: 5,
      altitudeAccuracy: null,
      altitude: null,
      speed: null,
      heading: null,
      magneticHeading: null,
      trueHeading: null,
      headingAccuracy: null,
      course: null,
    },
  });
  const plugin = {
    getCurrentPosition: vi.fn(async () => createPosition(48.14)),
    watchPosition: vi.fn((_options: PositionOptions, callback: WatchPositionCallback) => {
      const id = `watch-${++nextId}`;
      watchers.set(id, callback);
      return deferred
        ? new Promise<string>(resolve => pendingIds.push(() => resolve(id)))
        : Promise.resolve(id);
    }),
    clearWatch: vi.fn(async ({ id }: { id: string }) => {
      watchers.delete(id);
    }),
    checkPermissions: vi.fn(async () => ({ location: 'granted', coarseLocation: 'granted' })),
    requestPermissions: vi.fn(async () => ({ location: 'granted', coarseLocation: 'granted' })),
  };
  const fake: FakeGeolocation = {
    watchers,
    createPosition,
    emit: (position, error) => watchers.forEach(callback => callback(position, error)),
    deferIds: defer => {
      deferred = defer;
    },
    flushIds: () => pendingIds.splice(0).forEach(resolve => resolve()),
    reset: () => {
      watchers.clear();
      pendingIds.length = 0;
      deferred = false;
      plugin.watchPosition.mockClear();
      plugin.clearWatch.mockClear();
    },
  };
  return { Geolocation: Object.assign(plugin, { __fake: fake }) };
});

const fake = (Geolocation as unknown as { __fake: FakeGeolocation }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/geolocation', () => {
  beforeEach(() => fake.reset());

  it('useWatchPosition reports positions and in-band errors', async () => {
    const { result } = renderHook(() => useWatchPosition(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const position = fake.createPosition(48.14);
    act(() => fake.emit(position));
    expect(result.current.position).toEqual(position);
    expect(result.current.error).toBeUndefined();
    act(() => fake.emit(null, new Error('location unavailable')));
    expect(result.current.error).toEqual(new Error('location unavailable'));
  });

  it('useWatchPosition passes the initial options to the plugin', async () => {
    renderHook(() => useWatchPosition({ enableHighAccuracy: true }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(vi.mocked(Geolocation.watchPosition).mock.calls[0]?.[0]).toEqual({
      enableHighAccuracy: true,
    });
  });

  it('useWatchPosition clears the watch on unmount', async () => {
    const { unmount } = renderHook(() => useWatchPosition(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(fake.watchers.size).toBe(1));
    unmount();
    await waitFor(() => expect(fake.watchers.size).toBe(0));
  });

  it('useWatchPosition clears the watch when unmounted before the id resolves', async () => {
    fake.deferIds(true);
    const { unmount } = renderHook(() => useWatchPosition());
    unmount();
    expect(fake.watchers.size).toBe(1);
    fake.flushIds();
    await waitFor(() => expect(fake.watchers.size).toBe(0));
  });

  it('useGeolocationPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useGeolocationPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() =>
      expect(result.current.status).toEqual({ location: 'granted', coarseLocation: 'granted' }),
    );
  });

  it('useGeolocation exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGeolocation(), { wrapper: StrictModeWrapper });
    await expect(result.current.getCurrentPosition()).resolves.toEqual(fake.createPosition(48.14));
  });
});
