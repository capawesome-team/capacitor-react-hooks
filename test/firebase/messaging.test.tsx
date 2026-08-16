import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useFirebaseMessaging,
  useFirebaseMessagingApnsTokenReceived,
  useFirebaseMessagingNotificationActionPerformed,
  useFirebaseMessagingNotificationReceived,
  useFirebaseMessagingPermissions,
  useFirebaseMessagingToken,
  useFirebaseMessagingTokenReceived,
} from '../../src/firebase/messaging';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/messaging', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getToken = vi.fn(async () => ({ token: 'fcm-token' }));
  fake.plugin.deleteToken = vi.fn(async () => undefined);
  fake.plugin.isSupported = vi.fn(async () => ({ isSupported: true }));
  fake.plugin.listChannels = vi.fn(async () => ({ channels: [] }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ receive: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ receive: 'granted' }));
  return { FirebaseMessaging: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FirebaseMessaging as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('firebase/messaging', () => {
  it('useFirebaseMessagingToken listens on mount and exposes the received token', async () => {
    const { result } = renderHook(() => useFirebaseMessagingToken(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('tokenReceived')).toBe(1);
    expect(result.current.token).toBeUndefined();

    act(() => fake.emit('tokenReceived', { token: 'refreshed-token' }));
    expect(result.current.token).toBe('refreshed-token');
    expect(result.current.error).toBeUndefined();
  });

  it('useFirebaseMessagingToken requests the token imperatively', async () => {
    const { result, unmount } = renderHook(() => useFirebaseMessagingToken(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    await act(async () => {
      await expect(result.current.getToken()).resolves.toBe('fcm-token');
    });
    expect(result.current.token).toBe('fcm-token');
    unmount();
    expect(fake.listenerCount('tokenReceived')).toBe(0);
  });

  it('useFirebaseMessagingToken exposes token request errors', async () => {
    const { result } = renderHook(() => useFirebaseMessagingToken(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    vi.mocked(FirebaseMessaging.getToken).mockRejectedValueOnce(new Error('no permission'));
    await act(async () => {
      await expect(result.current.getToken()).resolves.toBeUndefined();
    });
    expect(result.current.error).toEqual(new Error('no permission'));
  });

  it('useFirebaseMessagingTokenReceived delivers tokens and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFirebaseMessagingTokenReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('tokenReceived', { token: 'fcm-token' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ token: 'fcm-token' });
    unmount();
    expect(fake.listenerCount('tokenReceived')).toBe(0);
  });

  it('useFirebaseMessagingApnsTokenReceived delivers tokens and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFirebaseMessagingApnsTokenReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('apnsTokenReceived', { token: 'APNS' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ token: 'APNS' });
    unmount();
    expect(fake.listenerCount('apnsTokenReceived')).toBe(0);
  });

  it('useFirebaseMessagingNotificationReceived delivers notifications and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFirebaseMessagingNotificationReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { notification: { id: '1', title: 'Hello' } };
    act(() => fake.emit('notificationReceived', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('notificationReceived')).toBe(0);
  });

  it('useFirebaseMessagingNotificationActionPerformed delivers actions and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(
      () => useFirebaseMessagingNotificationActionPerformed(callback),
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    const event = { actionId: 'tap', notification: { id: '1' } };
    act(() => fake.emit('notificationActionPerformed', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('notificationActionPerformed')).toBe(0);
  });

  it('useFirebaseMessagingPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useFirebaseMessagingPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ receive: 'granted' }));
  });

  it('useFirebaseMessaging exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseMessaging(), { wrapper: StrictModeWrapper });
    await expect(result.current.listChannels()).resolves.toEqual({ channels: [] });
    await expect(result.current.isSupported()).resolves.toEqual({ isSupported: true });
  });
});
