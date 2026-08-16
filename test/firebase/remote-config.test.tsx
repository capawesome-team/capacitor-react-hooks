import { FirebaseRemoteConfig } from '@capacitor-firebase/remote-config';
import { act, renderHook } from '@testing-library/react';

import { useConfigUpdate, useFirebaseRemoteConfig } from '../../src/firebase/remote-config';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/remote-config', () => {
  type ConfigUpdateCallback = (event: unknown, error: unknown) => void;
  const listeners = new Map<string, ConfigUpdateCallback>();
  let nextCallbackId = 0;
  const plugin = {
    addConfigUpdateListener: vi.fn((callback: ConfigUpdateCallback) => {
      const callbackId = `callback-${++nextCallbackId}`;
      listeners.set(callbackId, callback);
      return Promise.resolve(callbackId);
    }),
    removeConfigUpdateListener: vi.fn(async ({ id }: { id: string }) => {
      listeners.delete(id);
    }),
    fetchAndActivate: vi.fn(async () => undefined),
    getString: vi.fn(async () => ({ value: 'blue' })),
  };
  const fake = {
    listeners,
    emit: (event: unknown, error: unknown = null) =>
      listeners.forEach(callback => callback(event, error)),
  };
  return { FirebaseRemoteConfig: Object.assign(plugin, { __fake: fake }) };
});

interface FakeRemoteConfig {
  listeners: Map<string, unknown>;
  emit(event: unknown, error?: unknown): void;
}

const fake = (FirebaseRemoteConfig as unknown as { __fake: FakeRemoteConfig }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('firebase/remote-config', () => {
  it('useConfigUpdate delivers the updated keys', async () => {
    const { result } = renderHook(() => useConfigUpdate(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    expect(fake.listeners.size).toBe(1);
    expect(result.current.updatedKeys).toBeUndefined();

    act(() => fake.emit({ updatedKeys: ['theme'] }));
    expect(result.current.updatedKeys).toEqual(['theme']);
    expect(result.current.error).toBeUndefined();
  });

  it('useConfigUpdate routes in-band errors to error', async () => {
    const { result } = renderHook(() => useConfigUpdate(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit(null, 'not implemented on web'));
    expect(result.current.error).toEqual(new Error('not implemented on web'));
    act(() => fake.emit({ updatedKeys: ['theme'] }));
    expect(result.current.error).toBeUndefined();
  });

  it('useConfigUpdate removes the listener on unmount', async () => {
    const { unmount } = renderHook(() => useConfigUpdate(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const callbackId = [...fake.listeners.keys()][0];
    unmount();
    await flushMicrotasks();
    expect(FirebaseRemoteConfig.removeConfigUpdateListener).toHaveBeenCalledWith({
      id: callbackId,
    });
    expect(fake.listeners.size).toBe(0);
  });

  it('useConfigUpdate detaches the listener when disabled', async () => {
    const { rerender } = renderHook(({ enabled }) => useConfigUpdate({ enabled }), {
      initialProps: { enabled: true },
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listeners.size).toBe(1);
    rerender({ enabled: false });
    await flushMicrotasks();
    expect(fake.listeners.size).toBe(0);
  });

  it('useFirebaseRemoteConfig exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseRemoteConfig(), { wrapper: StrictModeWrapper });
    await expect(result.current.getString({ key: 'theme' })).resolves.toEqual({ value: 'blue' });
    await expect(result.current.fetchAndActivate()).resolves.toBeUndefined();
  });
});
