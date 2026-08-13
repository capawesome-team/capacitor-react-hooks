import { LocalNotifications } from '@capacitor/local-notifications';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useLocalNotificationActionPerformed,
  useLocalNotificationReceived,
  useLocalNotifications,
  useLocalNotificationsPermissions,
} from '../../src/capacitor/local-notifications';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/local-notifications', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getPending = vi.fn(async () => ({ notifications: [] }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ display: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ display: 'granted' }));
  fake.plugin.checkExactNotificationSetting = vi.fn(async () => ({ exact_alarm: 'granted' }));
  return { LocalNotifications: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (LocalNotifications as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/local-notifications', () => {
  it('useLocalNotificationReceived delivers notifications and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLocalNotificationReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const notification = { id: 1, title: 'Hello', body: 'World' };
    act(() => fake.emit('localNotificationReceived', notification));
    expect(callback).toHaveBeenCalledExactlyOnceWith(notification);
    unmount();
    expect(fake.listenerCount('localNotificationReceived')).toBe(0);
  });

  it('useLocalNotificationActionPerformed delivers actions and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLocalNotificationActionPerformed(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const action = { actionId: 'tap', notification: { id: 1, title: 'Hello', body: 'World' } };
    act(() => fake.emit('localNotificationActionPerformed', action));
    expect(callback).toHaveBeenCalledExactlyOnceWith(action);
    unmount();
    expect(fake.listenerCount('localNotificationActionPerformed')).toBe(0);
  });

  it('useLocalNotificationsPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useLocalNotificationsPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ display: 'granted' }));
  });

  it('useLocalNotifications exposes the plugin methods', async () => {
    const { result } = renderHook(() => useLocalNotifications(), { wrapper: StrictModeWrapper });
    await expect(result.current.getPending()).resolves.toEqual({ notifications: [] });
    await expect(result.current.checkExactNotificationSetting()).resolves.toEqual({
      exact_alarm: 'granted',
    });
  });
});
