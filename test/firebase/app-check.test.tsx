import { FirebaseAppCheck } from '@capacitor-firebase/app-check';
import { act, renderHook } from '@testing-library/react';

import { useAppCheckTokenChanged, useFirebaseAppCheck } from '../../src/firebase/app-check';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/app-check', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getToken = vi.fn(async () => ({ token: 'token-1', expireTimeMillis: 1000 }));
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.setTokenAutoRefreshEnabled = vi.fn(async () => undefined);
  return { FirebaseAppCheck: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FirebaseAppCheck as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('firebase/app-check', () => {
  it('useFirebaseAppCheck exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseAppCheck(), { wrapper: StrictModeWrapper });

    await expect(result.current.getToken()).resolves.toEqual({
      token: 'token-1',
      expireTimeMillis: 1000,
    });
    await expect(result.current.initialize({ debugToken: true })).resolves.toBeUndefined();
    expect(FirebaseAppCheck.initialize).toHaveBeenCalledWith({ debugToken: true });
    await expect(
      result.current.setTokenAutoRefreshEnabled({ enabled: true }),
    ).resolves.toBeUndefined();
  });

  it('useAppCheckTokenChanged delivers token changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAppCheckTokenChanged(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();

    act(() => fake.emit('tokenChanged', { token: 'token-2' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ token: 'token-2' });

    unmount();
    expect(fake.listenerCount('tokenChanged')).toBe(0);
  });

  it('useAppCheckTokenChanged detaches the listener when disabled', async () => {
    renderHook(() => useAppCheckTokenChanged(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();

    expect(fake.listenerCount('tokenChanged')).toBe(0);
  });
});
