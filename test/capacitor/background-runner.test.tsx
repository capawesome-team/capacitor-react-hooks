import { BackgroundRunner } from '@capacitor/background-runner';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBackgroundRunner,
  useBackgroundRunnerPermissions,
} from '../../src/capacitor/background-runner';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/background-runner', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.dispatchEvent = vi.fn(async () => ({ value: 'dispatched' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({
    geolocation: 'granted',
    notifications: 'prompt',
  }));
  fake.plugin.requestPermissions = vi.fn(async () => ({
    geolocation: 'granted',
    notifications: 'granted',
  }));
  return { BackgroundRunner: fake.plugin };
});

describe('capacitor/background-runner', () => {
  it('useBackgroundRunner exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBackgroundRunner(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.dispatchEvent({
        label: 'com.example.background.task',
        event: 'myCustomEvent',
        details: { id: 1 },
      }),
    ).resolves.toEqual({ value: 'dispatched' });
  });

  it('useBackgroundRunnerPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useBackgroundRunnerPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() =>
      expect(result.current.status).toEqual({ geolocation: 'granted', notifications: 'prompt' }),
    );
  });

  it('useBackgroundRunnerPermissions requests the permissions for the given APIs', async () => {
    const { result } = renderHook(() => useBackgroundRunnerPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toBeDefined());
    const status = await act(() => result.current.request({ apis: ['notifications'] }));
    expect(status).toEqual({ geolocation: 'granted', notifications: 'granted' });
    expect(result.current.status).toEqual({ geolocation: 'granted', notifications: 'granted' });
    expect(BackgroundRunner.requestPermissions).toHaveBeenCalledWith({ apis: ['notifications'] });
  });
});
