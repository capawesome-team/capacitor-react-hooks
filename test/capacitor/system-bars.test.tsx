import type * as CapacitorCore from '@capacitor/core';
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';
import { renderHook } from '@testing-library/react';

import { useSystemBars } from '../../src/capacitor/system-bars';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/core', async () => {
  const actual = await vi.importActual<typeof CapacitorCore>('@capacitor/core');
  return {
    ...actual,
    SystemBars: {
      setStyle: vi.fn(async () => undefined),
      show: vi.fn(async () => undefined),
      hide: vi.fn(async () => undefined),
      setAnimation: vi.fn(async () => undefined),
    },
  };
});

describe('capacitor/system-bars', () => {
  it('useSystemBars exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSystemBars(), { wrapper: StrictModeWrapper });
    await expect(result.current.setStyle({ style: SystemBarsStyle.Dark })).resolves.toBeUndefined();
    expect(SystemBars.setStyle).toHaveBeenCalledWith({ style: SystemBarsStyle.Dark });
    await expect(result.current.hide({ bar: SystemBarType.StatusBar })).resolves.toBeUndefined();
    await expect(result.current.show({ bar: SystemBarType.StatusBar })).resolves.toBeUndefined();
    await expect(result.current.setAnimation({ animation: 'FADE' })).resolves.toBeUndefined();
  });
});
