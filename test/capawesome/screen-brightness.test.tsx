import { ScreenBrightness } from '@capawesome/capacitor-screen-brightness';
import { renderHook } from '@testing-library/react';

import { useScreenBrightness } from '../../src/capawesome/screen-brightness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-screen-brightness', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getBrightness = vi.fn(async () => ({ brightness: 0.5 }));
  fake.plugin.resetBrightness = vi.fn(async () => undefined);
  fake.plugin.setBrightness = vi.fn(async () => undefined);
  return { ScreenBrightness: fake.plugin };
});

const setBrightness = vi.mocked(ScreenBrightness.setBrightness);

describe('capawesome/screen-brightness', () => {
  it('useScreenBrightness exposes getBrightness', async () => {
    const { result } = renderHook(() => useScreenBrightness(), { wrapper: StrictModeWrapper });
    await expect(result.current.getBrightness()).resolves.toEqual({ brightness: 0.5 });
  });

  it('useScreenBrightness exposes setBrightness', async () => {
    const { result } = renderHook(() => useScreenBrightness(), { wrapper: StrictModeWrapper });
    await result.current.setBrightness({ brightness: 0.25 });
    expect(setBrightness).toHaveBeenCalledExactlyOnceWith({ brightness: 0.25 });
  });
});
