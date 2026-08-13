import { PrivacyScreen } from '@capawesome/capacitor-privacy-screen';
import { act, renderHook } from '@testing-library/react';

import { usePrivacyScreen, useScreenshotTaken } from '../../src/capawesome/privacy-screen';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-privacy-screen', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.enable = vi.fn(async () => undefined);
  fake.plugin.disable = vi.fn(async () => undefined);
  fake.plugin.isEnabled = vi.fn(async () => ({ enabled: false }));
  return { PrivacyScreen: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (PrivacyScreen as unknown as { __fake: FakePlugin }).__fake;

describe('capawesome/privacy-screen', () => {
  it('usePrivacyScreen exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePrivacyScreen(), { wrapper: StrictModeWrapper });
    await act(() => result.current.enable({ ios: { preventScreenshots: true } }));
    expect(PrivacyScreen.enable).toHaveBeenCalledWith({ ios: { preventScreenshots: true } });
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: false });
    await act(() => result.current.disable());
    expect(PrivacyScreen.disable).toHaveBeenCalled();
  });

  it('useScreenshotTaken delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useScreenshotTaken(callback), {
      wrapper: StrictModeWrapper,
    });
    await act(() => Promise.resolve());
    act(() => fake.emit('screenshotTaken'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('screenshotTaken')).toBe(0);
  });
});
