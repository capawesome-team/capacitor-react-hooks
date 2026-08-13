import { PushNotifications } from '@capacitor/push-notifications';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  usePushNotificationActionPerformed,
  usePushNotificationReceived,
  usePushNotifications,
  usePushNotificationsPermissions,
  usePushToken,
} from '../../src/capacitor/push-notifications';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/push-notifications', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.register = vi.fn(async () => undefined);
  fake.plugin.unregister = vi.fn(async () => undefined);
  fake.plugin.listChannels = vi.fn(async () => ({ channels: [] }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ receive: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ receive: 'granted' }));
  return { PushNotifications: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (PushNotifications as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/push-notifications', () => {
  it('usePushToken listens before register and exposes the token', async () => {
    const { result } = renderHook(() => usePushToken(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    expect(fake.listenerCount('registration')).toBe(1);
    expect(fake.listenerCount('registrationError')).toBe(1);
    expect(result.current.token).toBeUndefined();

    await act(() => result.current.register());
    expect(PushNotifications.register).toHaveBeenCalled();
    act(() => fake.emit('registration', { value: 'apns-token' }));
    expect(result.current.token).toBe('apns-token');
    expect(result.current.error).toBeUndefined();
  });

  it('usePushToken exposes registration errors', async () => {
    const { result, unmount } = renderHook(() => usePushToken(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('registrationError', { error: 'no network' }));
    expect(result.current.error).toEqual(new Error('no network'));
    unmount();
    expect(fake.listenerCount('registration')).toBe(0);
    expect(fake.listenerCount('registrationError')).toBe(0);
  });

  it('usePushNotificationReceived delivers notifications and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePushNotificationReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const notification = { id: '1', title: 'Hello', data: {} };
    act(() => fake.emit('pushNotificationReceived', notification));
    expect(callback).toHaveBeenCalledExactlyOnceWith(notification);
    unmount();
    expect(fake.listenerCount('pushNotificationReceived')).toBe(0);
  });

  it('usePushNotificationActionPerformed delivers actions and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePushNotificationActionPerformed(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const action = { actionId: 'tap', notification: { id: '1', data: {} } };
    act(() => fake.emit('pushNotificationActionPerformed', action));
    expect(callback).toHaveBeenCalledExactlyOnceWith(action);
    unmount();
    expect(fake.listenerCount('pushNotificationActionPerformed')).toBe(0);
  });

  it('usePushNotificationsPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => usePushNotificationsPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ receive: 'granted' }));
  });

  it('usePushNotifications exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: StrictModeWrapper });
    await expect(result.current.listChannels()).resolves.toEqual({ channels: [] });
  });
});
