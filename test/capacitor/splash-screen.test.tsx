import { SplashScreen } from '@capacitor/splash-screen';
import { renderHook } from '@testing-library/react';

import { useSplashScreen } from '../../src/capacitor/splash-screen';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/splash-screen', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.show = vi.fn(async () => undefined);
  fake.plugin.hide = vi.fn(async () => undefined);
  return { SplashScreen: fake.plugin };
});

describe('capacitor/splash-screen', () => {
  it('useSplashScreen exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSplashScreen(), { wrapper: StrictModeWrapper });
    await expect(result.current.show({ autoHide: false })).resolves.toBeUndefined();
    expect(SplashScreen.show).toHaveBeenCalledExactlyOnceWith({ autoHide: false });
    await expect(result.current.hide()).resolves.toBeUndefined();
  });
});
