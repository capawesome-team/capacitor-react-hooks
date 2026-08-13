import { PrivacyScreen } from '@capacitor/privacy-screen';
import { act, renderHook } from '@testing-library/react';

import { usePrivacyScreen } from '../../src/capacitor/privacy-screen';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/privacy-screen', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.enable = vi.fn(async () => ({ success: true }));
  fake.plugin.disable = vi.fn(async () => ({ success: true }));
  fake.plugin.isEnabled = vi.fn(async () => ({ enabled: false }));
  return { PrivacyScreen: fake.plugin };
});

describe('capacitor/privacy-screen', () => {
  it('usePrivacyScreen exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePrivacyScreen(), { wrapper: StrictModeWrapper });
    await act(() => result.current.enable({ ios: { blurEffect: 'dark' } }));
    expect(PrivacyScreen.enable).toHaveBeenCalledWith({ ios: { blurEffect: 'dark' } });
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: false });
    await act(() => result.current.disable());
    expect(PrivacyScreen.disable).toHaveBeenCalled();
  });
});
