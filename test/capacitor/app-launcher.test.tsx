import { AppLauncher } from '@capacitor/app-launcher';
import { renderHook } from '@testing-library/react';

import { useAppLauncher } from '../../src/capacitor/app-launcher';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: {
    canOpenUrl: vi.fn(async () => ({ value: true })),
    openUrl: vi.fn(async () => ({ completed: true })),
  },
}));

describe('capacitor/app-launcher', () => {
  it('useAppLauncher exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppLauncher(), { wrapper: StrictModeWrapper });
    await expect(result.current.canOpenUrl({ url: 'mailto:' })).resolves.toEqual({ value: true });
    await expect(result.current.openUrl({ url: 'mailto:' })).resolves.toEqual({ completed: true });
    expect(AppLauncher.openUrl).toHaveBeenCalledWith({ url: 'mailto:' });
  });

  it('useAppLauncher keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useAppLauncher(), { wrapper: StrictModeWrapper });
    const { openUrl } = result.current;
    rerender();
    expect(result.current.openUrl).toBe(openUrl);
  });
});
