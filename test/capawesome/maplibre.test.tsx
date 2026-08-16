import type { CreateMapOptions } from '@capawesome/capacitor-maplibre';
import { MapLibre } from '@capawesome/capacitor-maplibre';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useMapClick,
  useMapLibre,
  useMapLibreMap,
  useMapLibrePermissions,
} from '../../src/capawesome/maplibre';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-maplibre', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  const operations: string[] = [];
  const createOptions: unknown[] = [];
  const pendingCreates: (() => void)[] = [];
  const state = { deferCreates: false, createError: undefined as unknown };

  fake.plugin.createMap = vi.fn((options: unknown) => {
    createOptions.push(options);
    if (state.createError !== undefined) {
      return Promise.reject(state.createError);
    }
    const complete = (resolve: () => void) => {
      operations.push('create');
      resolve();
    };
    if (!state.deferCreates) {
      return new Promise<void>(complete);
    }
    return new Promise<void>(resolve => pendingCreates.push(() => complete(resolve)));
  });
  fake.plugin.destroyMap = vi.fn(() => {
    operations.push('destroy');
    return Promise.resolve();
  });
  fake.plugin.getCamera = vi.fn(async () => ({ camera: { zoom: 8 } }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ location: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ location: 'granted' }));

  const map = {
    operations,
    createOptions,
    deferCreates: () => {
      state.deferCreates = true;
    },
    flushCreates: () => pendingCreates.splice(0).forEach(resolve => resolve()),
    failCreates: (error: unknown) => {
      state.createError = error;
    },
    reset: () => {
      operations.length = 0;
      createOptions.length = 0;
      pendingCreates.length = 0;
      state.deferCreates = false;
      state.createError = undefined;
    },
  };

  return { MapLibre: Object.assign(fake.plugin, { __fake: fake, __map: map }) };
});

interface FakeMapLibreMaps {
  operations: string[];
  createOptions: unknown[];
  deferCreates(): void;
  flushCreates(): void;
  failCreates(error: unknown): void;
  reset(): void;
}

const fake = (MapLibre as unknown as { __fake: FakePlugin }).__fake;
const map = (MapLibre as unknown as { __map: FakeMapLibreMaps }).__map;
const destroyMap = vi.mocked(MapLibre.destroyMap);

const flushMicrotasks = () => act(() => Promise.resolve());

const createConfig = (zoom: number): CreateMapOptions => ({
  center: { latitude: 51, longitude: 7 },
  elementId: 'map-element',
  mapId: 'map',
  zoom,
});

function last<T>(values: T[]): T {
  const value = values[values.length - 1];
  if (value === undefined) {
    throw new Error('Expected at least one entry.');
  }
  return value;
}

describe('capawesome/maplibre', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    map.reset();
  });

  it('creates the map for the given configuration', async () => {
    const { result } = renderHook(() => useMapLibreMap({ config: createConfig(8) }), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.mapId).toBe('map'));
    expect(last(map.createOptions)).toEqual(createConfig(8));
    expect(result.current.error).toBeUndefined();
  });

  it('destroys the previous map before recreating it with the same identifier', async () => {
    map.deferCreates();
    const { rerender } = renderHook(({ zoom }) => useMapLibreMap({ config: createConfig(zoom) }), {
      initialProps: { zoom: 8 },
    });
    await waitFor(() => expect(map.createOptions).toHaveLength(1));

    rerender({ zoom: 12 });
    map.flushCreates();
    await waitFor(() => expect(map.createOptions).toHaveLength(2));
    map.flushCreates();
    await waitFor(() => expect(map.operations).toEqual(['create', 'destroy', 'create']));
  });

  it('does not create the map while disabled', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useMapLibreMap({ config: createConfig(8), enabled }),
      { initialProps: { enabled: false }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(map.createOptions).toHaveLength(0);
    expect(result.current.mapId).toBeUndefined();

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.mapId).toBe('map'));
  });

  it('destroys the map on unmount', async () => {
    const { result, unmount } = renderHook(() => useMapLibreMap({ config: createConfig(8) }), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.mapId).toBe('map'));

    unmount();
    await waitFor(() => expect(map.operations).toEqual(['create', 'destroy']));
    expect(destroyMap).toHaveBeenCalledExactlyOnceWith({ mapId: 'map' });
  });

  it('destroys the map when unmounted before the creation resolves', async () => {
    map.deferCreates();
    const { unmount } = renderHook(() => useMapLibreMap({ config: createConfig(8) }));
    await waitFor(() => expect(map.createOptions).toHaveLength(1));

    unmount();
    map.flushCreates();
    await waitFor(() => expect(map.operations).toEqual(['create', 'destroy']));
    expect(destroyMap).toHaveBeenCalledExactlyOnceWith({ mapId: 'map' });
  });

  it('exposes a failed creation as error', async () => {
    map.failCreates('element not found.');
    const { result } = renderHook(() => useMapLibreMap({ config: createConfig(8) }), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.error).toEqual(new Error('element not found.')));
    expect(result.current.mapId).toBeUndefined();
    expect(destroyMap).not.toHaveBeenCalled();
  });

  it('recreates the map when the config content changes', async () => {
    const { result, rerender } = renderHook(
      ({ zoom }) => useMapLibreMap({ config: createConfig(zoom) }),
      { initialProps: { zoom: 8 }, wrapper: StrictModeWrapper },
    );
    await waitFor(() => expect(result.current.mapId).toBe('map'));

    rerender({ zoom: 12 });
    await waitFor(() => expect(map.operations).toEqual(['create', 'destroy', 'create']));
    expect(last(map.createOptions)).toEqual(createConfig(12));
  });

  it('keeps the map when an equal config is recreated', async () => {
    const { result, rerender } = renderHook(
      ({ zoom }) => useMapLibreMap({ config: createConfig(zoom) }),
      { initialProps: { zoom: 8 }, wrapper: StrictModeWrapper },
    );
    await waitFor(() => expect(result.current.mapId).toBe('map'));
    const operationCount = map.operations.length;

    rerender({ zoom: 8 });
    await flushMicrotasks();
    expect(map.operations).toHaveLength(operationCount);
    expect(result.current.mapId).toBe('map');
  });

  it('useMapClick delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const clickEvent = {
      coordinates: { latitude: 51, longitude: 7 },
      mapId: 'map',
      point: { x: 10, y: 20 },
    };
    const { unmount } = renderHook(() => useMapClick(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('mapClick', clickEvent));
    expect(callback).toHaveBeenCalledExactlyOnceWith(clickEvent);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('mapClick')).toBe(0);
  });

  it('useMapLibrePermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useMapLibrePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ location: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ location: 'granted' });
  });

  it('useMapLibre exposes getCamera', async () => {
    const { result } = renderHook(() => useMapLibre(), { wrapper: StrictModeWrapper });
    await expect(result.current.getCamera({ mapId: 'map' })).resolves.toEqual({
      camera: { zoom: 8 },
    });
  });
});
