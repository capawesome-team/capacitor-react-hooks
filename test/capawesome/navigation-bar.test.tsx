import { NavigationBar } from '@capawesome/capacitor-navigation-bar';
import { renderHook } from '@testing-library/react';

import { useNavigationBar } from '../../src/capawesome/navigation-bar';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-navigation-bar', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getColor = vi.fn(async () => ({ color: '#ffffff' }));
  fake.plugin.getStyle = vi.fn(async () => ({ style: 'LIGHT' }));
  fake.plugin.hide = vi.fn(async () => undefined);
  fake.plugin.setColor = vi.fn(async () => undefined);
  fake.plugin.setStyle = vi.fn(async () => undefined);
  fake.plugin.show = vi.fn(async () => undefined);
  return { NavigationBar: fake.plugin };
});

describe('capawesome/navigation-bar', () => {
  it('useNavigationBar exposes the plugin methods', async () => {
    const { result } = renderHook(() => useNavigationBar(), { wrapper: StrictModeWrapper });
    await expect(result.current.getColor()).resolves.toEqual({ color: '#ffffff' });
    await expect(result.current.getStyle()).resolves.toEqual({ style: 'LIGHT' });
    await expect(result.current.hide()).resolves.toBeUndefined();
    await expect(result.current.show()).resolves.toBeUndefined();
    await result.current.setColor({ color: '#000000' });
    expect(NavigationBar.setColor).toHaveBeenCalledWith({ color: '#000000' });
  });

  it('useNavigationBar keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useNavigationBar(), {
      wrapper: StrictModeWrapper,
    });
    const { getColor } = result.current;
    rerender();
    expect(result.current.getColor).toBe(getColor);
  });
});
