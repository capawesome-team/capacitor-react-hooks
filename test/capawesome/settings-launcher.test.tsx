import type { AndroidSettingsPage } from '@capawesome/capacitor-settings-launcher';
import { SettingsLauncher } from '@capawesome/capacitor-settings-launcher';
import { act, renderHook } from '@testing-library/react';

import { useSettingsLauncher } from '../../src/capawesome/settings-launcher';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-settings-launcher', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.openAndroidSettings = vi.fn(async () => undefined);
  fake.plugin.openAppSettings = vi.fn(async () => undefined);
  fake.plugin.openNotificationSettings = vi.fn(async () => undefined);
  return { SettingsLauncher: fake.plugin };
});

describe('capawesome/settings-launcher', () => {
  it('useSettingsLauncher exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSettingsLauncher(), { wrapper: StrictModeWrapper });
    await act(() => result.current.openAndroidSettings({ page: 'WIFI' as AndroidSettingsPage }));
    expect(SettingsLauncher.openAndroidSettings).toHaveBeenCalledWith({ page: 'WIFI' });
    await act(() => result.current.openAppSettings());
    expect(SettingsLauncher.openAppSettings).toHaveBeenCalled();
    await act(() => result.current.openNotificationSettings());
    expect(SettingsLauncher.openNotificationSettings).toHaveBeenCalled();
  });
});
