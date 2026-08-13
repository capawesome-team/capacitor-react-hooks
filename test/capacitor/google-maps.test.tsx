import { GoogleMap } from '@capacitor/google-maps';
import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';

import { useGoogleMap } from '../../src/capacitor/google-maps';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/google-maps', () => {
  interface CreateOptions {
    id: string;
    apiKey: string;
    config: unknown;
    element: HTMLElement;
  }
  const createOptions: CreateOptions[] = [];
  const instances: FakeGoogleMap[] = [];
  const pendingCreates: (() => void)[] = [];
  const state = { deferCreates: false, createError: undefined as unknown };

  class FakeGoogleMap {
    destroy = vi.fn(() => Promise.resolve());

    static create(options: CreateOptions): Promise<FakeGoogleMap> {
      createOptions.push(options);
      if (state.createError !== undefined) {
        return Promise.reject(state.createError);
      }
      const map = new FakeGoogleMap();
      instances.push(map);
      if (!state.deferCreates) {
        return Promise.resolve(map);
      }
      return new Promise(resolve => pendingCreates.push(() => resolve(map)));
    }
  }

  const fake = {
    createOptions,
    instances,
    deferCreates: () => {
      state.deferCreates = true;
    },
    flushCreates: () => pendingCreates.splice(0).forEach(resolve => resolve()),
    failCreates: (error: unknown) => {
      state.createError = error;
    },
    reset: () => {
      createOptions.length = 0;
      instances.length = 0;
      pendingCreates.length = 0;
      state.deferCreates = false;
      state.createError = undefined;
    },
  };

  return { GoogleMap: Object.assign(FakeGoogleMap, { __fake: fake }) };
});

interface FakeMap {
  destroy: ReturnType<typeof vi.fn>;
}

interface FakeGoogleMaps {
  createOptions: { id: string; apiKey: string; config: unknown; element: HTMLElement }[];
  instances: FakeMap[];
  deferCreates(): void;
  flushCreates(): void;
  failCreates(error: unknown): void;
  reset(): void;
}

const fake = (GoogleMap as unknown as { __fake: FakeGoogleMaps }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

function last<T>(values: T[]): T {
  const value = values[values.length - 1];
  if (value === undefined) {
    throw new Error('Expected at least one entry.');
  }
  return value;
}

const createConfig = (zoom: number) => ({ center: { lat: 51, lng: 7 }, zoom });

let elementRef: RefObject<HTMLElement | null>;

describe('capacitor/google-maps', () => {
  beforeEach(() => {
    fake.reset();
    elementRef = { current: document.createElement('div') };
  });

  it('creates the map for the referenced element and returns the instance', async () => {
    const { result } = renderHook(
      () => useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(8), elementRef }),
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(last(fake.createOptions)).toEqual({
      id: 'map',
      apiKey: 'key',
      config: createConfig(8),
      element: elementRef.current,
    });
    expect(result.current.map).toBe(last(fake.instances));
    expect(last(fake.instances).destroy).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
  });

  it('does not create the map while disabled', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(8), elementRef, enabled }),
      { initialProps: { enabled: false }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.createOptions).toHaveLength(0);
    expect(result.current.map).toBeUndefined();
    rerender({ enabled: true });
    await flushMicrotasks();
    expect(result.current.map).toBe(last(fake.instances));
  });

  it('destroys the map on unmount', async () => {
    const { unmount } = renderHook(
      () => useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(8), elementRef }),
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    const map = last(fake.instances);
    unmount();
    await flushMicrotasks();
    expect(map.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the map when unmounted before create resolves', async () => {
    fake.deferCreates();
    const { unmount } = renderHook(() =>
      useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(8), elementRef }),
    );
    unmount();
    fake.flushCreates();
    await flushMicrotasks();
    expect(last(fake.instances).destroy).toHaveBeenCalledTimes(1);
  });

  it('exposes a failed creation as error', async () => {
    fake.failCreates('missing api key');
    const { result } = renderHook(
      () => useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(8), elementRef }),
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(result.current.error).toEqual(new Error('missing api key'));
    expect(result.current.map).toBeUndefined();
  });

  it('recreates the map when the config content changes', async () => {
    const { result, rerender } = renderHook(
      ({ zoom }) =>
        useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(zoom), elementRef }),
      { initialProps: { zoom: 8 }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    const previousMap = last(fake.instances);
    rerender({ zoom: 12 });
    await flushMicrotasks();
    expect(last(fake.createOptions).config).toEqual(createConfig(12));
    expect(previousMap.destroy).toHaveBeenCalledTimes(1);
    expect(result.current.map).toBe(last(fake.instances));
  });

  it('keeps the map when an equal config is recreated', async () => {
    const { result, rerender } = renderHook(
      ({ zoom }) =>
        useGoogleMap({ id: 'map', apiKey: 'key', config: createConfig(zoom), elementRef }),
      { initialProps: { zoom: 8 }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    const map = last(fake.instances);
    const createCount = fake.createOptions.length;
    rerender({ zoom: 8 });
    await flushMicrotasks();
    expect(fake.createOptions).toHaveLength(createCount);
    expect(map.destroy).not.toHaveBeenCalled();
    expect(result.current.map).toBe(map);
  });
});
