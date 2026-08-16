import { Geofences } from '@capawesome-team/capacitor-geofences';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useGeofences,
  useGeofencesPermissions,
  useGeofencesSyncFailed,
  useGeofenceTransition,
} from '../../src/capawesome/geofences';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-geofences', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.addGeofences = vi.fn(async () => ({ ids: ['geofence-1'] }));
  fake.plugin.getGeofences = vi.fn(async () => ({ geofences: [] }));
  fake.plugin.removeAllGeofences = vi.fn(async () => undefined);
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
  return { Geofences: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Geofences as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/geofences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGeofences exposes the plugin methods', async () => {
    const geofence = { latitude: 37.33182, longitude: -122.03118, radius: 200 };
    const { result } = renderHook(() => useGeofences(), { wrapper: StrictModeWrapper });
    await expect(result.current.addGeofences({ geofences: [geofence] })).resolves.toEqual({
      ids: ['geofence-1'],
    });
    expect(Geofences.addGeofences).toHaveBeenCalledExactlyOnceWith({ geofences: [geofence] });
    await expect(result.current.getGeofences()).resolves.toEqual({ geofences: [] });
  });

  it('useGeofencesPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useGeofencesPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status?.location).toBe('prompt'));

    await act(() => result.current.request());
    expect(result.current.status?.location).toBe('granted');
  });

  it('useGeofenceTransition delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGeofenceTransition(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = {
      id: 'geofence-1',
      latitude: 37.33182,
      longitude: -122.03118,
      timestamp: 1748874591694,
      transitionType: 'ENTER',
    };
    act(() => fake.emit('geofenceTransition', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('geofenceTransition')).toBe(0);
  });

  it('useGeofencesSyncFailed delivers events', async () => {
    const callback = vi.fn();
    renderHook(() => useGeofencesSyncFailed(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const event = { message: 'Upload failed with status code 500.', statusCode: 500 };
    act(() => fake.emit('syncFailed', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
  });
});
