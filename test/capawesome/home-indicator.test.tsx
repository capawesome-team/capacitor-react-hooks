import { HomeIndicator } from '@capawesome/capacitor-home-indicator';
import { renderHook } from '@testing-library/react';

import { useHomeIndicator } from '../../src/capawesome/home-indicator';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-home-indicator', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.hide = vi.fn(async () => undefined);
  fake.plugin.isHidden = vi.fn(async () => ({ hidden: true }));
  fake.plugin.show = vi.fn(async () => undefined);
  return { HomeIndicator: fake.plugin };
});

describe('capawesome/home-indicator', () => {
  it('useHomeIndicator exposes the plugin methods', async () => {
    const { result } = renderHook(() => useHomeIndicator(), { wrapper: StrictModeWrapper });
    await expect(result.current.hide()).resolves.toBeUndefined();
    expect(HomeIndicator.hide).toHaveBeenCalled();
    await expect(result.current.isHidden()).resolves.toEqual({ hidden: true });
    await expect(result.current.show()).resolves.toBeUndefined();
  });

  it('useHomeIndicator keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useHomeIndicator(), {
      wrapper: StrictModeWrapper,
    });
    const { hide } = result.current;
    rerender();
    expect(result.current.hide).toBe(hide);
  });
});
