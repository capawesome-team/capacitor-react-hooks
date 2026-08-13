import { renderHook, waitFor } from '@testing-library/react';

import { useAlarm, useAlarmPermissions } from '../../src/capawesome/alarm';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-alarm', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.createAlarm = vi.fn(async () => ({ id: 'alarm-1' }));
  fake.plugin.createTimer = vi.fn(async () => undefined);
  fake.plugin.getAlarms = vi.fn(async () => ({ alarms: [] }));
  fake.plugin.cancelAlarm = vi.fn(async () => undefined);
  fake.plugin.openAlarms = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ alarms: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ alarms: 'granted' }));
  return { Alarm: fake.plugin };
});

describe('capawesome/alarm', () => {
  it('useAlarmPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useAlarmPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ alarms: 'granted' }));
  });

  it('useAlarm exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAlarm(), { wrapper: StrictModeWrapper });
    await expect(result.current.createAlarm({ hour: 6, minute: 30 })).resolves.toEqual({
      id: 'alarm-1',
    });
    await expect(result.current.getAlarms()).resolves.toEqual({ alarms: [] });
    await expect(result.current.cancelAlarm({ id: 'alarm-1' })).resolves.toBeUndefined();
  });
});
