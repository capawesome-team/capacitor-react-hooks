import { App } from '@capacitor/app';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useApp,
  useAppPause,
  useAppRestoredResult,
  useAppResume,
  useAppState,
  useAppStateChange,
  useAppUrlOpen,
  useBackButton,
} from '../../src/capacitor/app';
import type { ListenerOptions } from '../../src/core';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/app', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getState = vi.fn(async () => ({ isActive: true }));
  fake.plugin.getInfo = vi.fn(async () => ({
    name: 'Example',
    id: 'io.capawesome.example',
    build: '1',
    version: '1.0.0',
  }));
  fake.plugin.getLaunchUrl = vi.fn(async () => ({ url: 'https://capawesome.io/' }));
  return { App: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (App as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

const listenerHooks: [string, (callback: () => void, options?: ListenerOptions) => void][] = [
  ['appStateChange', useAppStateChange],
  ['pause', useAppPause],
  ['resume', useAppResume],
  ['appUrlOpen', useAppUrlOpen],
  ['appRestoredResult', useAppRestoredResult],
  ['backButton', useBackButton],
];

describe('capacitor/app', () => {
  it('useAppState seeds from getState and follows state change events', async () => {
    const { result } = renderHook(() => useAppState(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toEqual({ isActive: true }));
    act(() => fake.emit('appStateChange', { isActive: false }));
    expect(result.current).toEqual({ isActive: false });
  });

  it.each(listenerHooks)(
    '%s hook delivers events and removes its listener on unmount',
    async (event, useEvent) => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useEvent(callback), { wrapper: StrictModeWrapper });
      await flushMicrotasks();
      expect(fake.listenerCount(event)).toBe(1);
      act(() => fake.emit(event));
      expect(callback).toHaveBeenCalledOnce();
      unmount();
      expect(fake.listenerCount(event)).toBe(0);
    },
  );

  it('useAppUrlOpen receives the opened url', async () => {
    const callback = vi.fn();
    renderHook(() => useAppUrlOpen(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const event = { url: 'io.capawesome.example://login' };
    act(() => fake.emit('appUrlOpen', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
  });

  it('useApp exposes the plugin methods', async () => {
    const { result } = renderHook(() => useApp(), { wrapper: StrictModeWrapper });
    await expect(result.current.getInfo()).resolves.toEqual({
      name: 'Example',
      id: 'io.capawesome.example',
      build: '1',
      version: '1.0.0',
    });
    await expect(result.current.getLaunchUrl()).resolves.toEqual({
      url: 'https://capawesome.io/',
    });
  });
});
