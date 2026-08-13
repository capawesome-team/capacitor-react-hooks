import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useButtonClicked,
  useForegroundService,
  useForegroundServicePermissions,
  useNotificationTapped,
} from '../../src/capawesome/android-foreground-service';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-android-foreground-service', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.startForegroundService = vi.fn(async () => undefined);
  fake.plugin.stopForegroundService = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ display: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ display: 'granted' }));
  fake.plugin.checkManageOverlayPermission = vi.fn(async () => ({ granted: true }));
  return { ForegroundService: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ForegroundService as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/android-foreground-service', () => {
  it('useButtonClicked delivers button clicks and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useButtonClicked(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('buttonClicked', { buttonId: 123 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ buttonId: 123 });
    unmount();
    expect(fake.listenerCount('buttonClicked')).toBe(0);
  });

  it('useNotificationTapped delivers notification taps and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useNotificationTapped(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('notificationTapped', { notificationId: 1 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ notificationId: 1 });
    unmount();
    expect(fake.listenerCount('notificationTapped')).toBe(0);
  });

  it('useForegroundServicePermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useForegroundServicePermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ display: 'granted' }));
  });

  it('useForegroundService exposes the plugin methods', async () => {
    const { result } = renderHook(() => useForegroundService(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkManageOverlayPermission()).resolves.toEqual({ granted: true });
    await expect(result.current.stopForegroundService()).resolves.toBeUndefined();
    await result.current.startForegroundService({
      body: 'Body',
      id: 1,
      smallIcon: 'ic_stat_icon',
      title: 'Title',
    });
    expect(ForegroundService.startForegroundService).toHaveBeenCalledWith({
      body: 'Body',
      id: 1,
      smallIcon: 'ic_stat_icon',
      title: 'Title',
    });
  });
});
