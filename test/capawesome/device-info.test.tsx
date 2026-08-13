import { renderHook } from '@testing-library/react';

import { useDeviceInfo } from '../../src/capawesome/device-info';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-device-info', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getId = vi.fn(async () => ({ identifier: 'device-id' }));
  fake.plugin.getInfo = vi.fn(async () => ({ model: 'iPhone13,4', platform: 'ios' }));
  fake.plugin.getUptime = vi.fn(async () => ({ uptime: 123456789 }));
  return { DeviceInfo: fake.plugin };
});

describe('capawesome/device-info', () => {
  it('useDeviceInfo exposes the plugin methods', async () => {
    const { result } = renderHook(() => useDeviceInfo(), { wrapper: StrictModeWrapper });
    await expect(result.current.getId()).resolves.toEqual({ identifier: 'device-id' });
    await expect(result.current.getInfo()).resolves.toEqual({
      model: 'iPhone13,4',
      platform: 'ios',
    });
    await expect(result.current.getUptime()).resolves.toEqual({ uptime: 123456789 });
  });
});
