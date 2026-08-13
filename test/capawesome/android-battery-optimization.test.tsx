import { renderHook } from '@testing-library/react';

import { useBatteryOptimization } from '../../src/capawesome/android-battery-optimization';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-android-battery-optimization', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isBatteryOptimizationEnabled = vi.fn(async () => ({ enabled: true }));
  fake.plugin.openBatteryOptimizationSettings = vi.fn(async () => undefined);
  fake.plugin.requestIgnoreBatteryOptimization = vi.fn(async () => undefined);
  return { BatteryOptimization: fake.plugin };
});

describe('capawesome/android-battery-optimization', () => {
  it('useBatteryOptimization exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBatteryOptimization(), { wrapper: StrictModeWrapper });
    await expect(result.current.isBatteryOptimizationEnabled()).resolves.toEqual({ enabled: true });
    await expect(result.current.openBatteryOptimizationSettings()).resolves.toBeUndefined();
    await expect(result.current.requestIgnoreBatteryOptimization()).resolves.toBeUndefined();
  });
});
