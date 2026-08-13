import { StatusBar } from '@capacitor/status-bar';
import { act, renderHook } from '@testing-library/react';

import {
  useStatusBar,
  useStatusBarOverlayChanged,
  useStatusBarVisibilityChanged,
} from '../../src/capacitor/status-bar';
import type { ListenerOptions } from '../../src/core';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/status-bar', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.show = vi.fn(async () => undefined);
  fake.plugin.hide = vi.fn(async () => undefined);
  fake.plugin.getInfo = vi.fn(async () => ({
    visible: true,
    style: 'DEFAULT',
    color: '#000000',
    overlays: false,
    height: 44,
  }));
  fake.plugin.setOverlaysWebView = vi.fn(async () => undefined);
  return { StatusBar: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (StatusBar as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

const listenerHooks: [string, (callback: () => void, options?: ListenerOptions) => void][] = [
  ['statusBarVisibilityChanged', useStatusBarVisibilityChanged],
  ['statusBarOverlayChanged', useStatusBarOverlayChanged],
];

describe('capacitor/status-bar', () => {
  it.each(listenerHooks)(
    '%s hook delivers events and removes its listener on unmount',
    async (event, useEvent) => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useEvent(callback), { wrapper: StrictModeWrapper });
      await flushMicrotasks();
      expect(fake.listenerCount(event)).toBe(1);
      const info = {
        visible: false,
        style: 'DEFAULT',
        color: '#000000',
        overlays: true,
        height: 0,
      };
      act(() => fake.emit(event, info));
      expect(callback).toHaveBeenCalledExactlyOnceWith(info);
      unmount();
      expect(fake.listenerCount(event)).toBe(0);
    },
  );

  it('useStatusBar exposes the plugin methods', async () => {
    const { result } = renderHook(() => useStatusBar(), { wrapper: StrictModeWrapper });
    await expect(result.current.hide()).resolves.toBeUndefined();
    await expect(result.current.getInfo()).resolves.toEqual({
      visible: true,
      style: 'DEFAULT',
      color: '#000000',
      overlays: false,
      height: 44,
    });
  });
});
