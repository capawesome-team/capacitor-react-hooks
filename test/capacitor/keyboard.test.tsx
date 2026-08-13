import { Keyboard } from '@capacitor/keyboard';
import { act, renderHook } from '@testing-library/react';

import {
  useKeyboard,
  useKeyboardDidHide,
  useKeyboardDidShow,
  useKeyboardState,
  useKeyboardWillHide,
  useKeyboardWillShow,
} from '../../src/capacitor/keyboard';
import type { ListenerOptions } from '../../src/core';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/keyboard', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.show = vi.fn(async () => undefined);
  fake.plugin.hide = vi.fn(async () => undefined);
  fake.plugin.getResizeMode = vi.fn(async () => ({ mode: 'native' }));
  return { Keyboard: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Keyboard as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

const listenerHooks: [string, (callback: () => void, options?: ListenerOptions) => void][] = [
  ['keyboardWillShow', useKeyboardWillShow],
  ['keyboardDidShow', useKeyboardDidShow],
  ['keyboardWillHide', useKeyboardWillHide],
  ['keyboardDidHide', useKeyboardDidHide],
];

describe('capacitor/keyboard', () => {
  it('useKeyboardState stays undefined until the first event and then tracks the keyboard', async () => {
    const { result } = renderHook(() => useKeyboardState(), { wrapper: StrictModeWrapper });
    expect(result.current).toBeUndefined();
    await flushMicrotasks();
    act(() => fake.emit('keyboardWillShow', { keyboardHeight: 320 }));
    expect(result.current).toEqual({ isVisible: true, height: 320 });
    act(() => fake.emit('keyboardWillHide'));
    expect(result.current).toEqual({ isVisible: false, height: 0 });
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

  it('useKeyboardWillShow receives the keyboard info', async () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardWillShow(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('keyboardWillShow', { keyboardHeight: 216 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ keyboardHeight: 216 });
  });

  it('useKeyboard exposes the plugin methods', async () => {
    const { result } = renderHook(() => useKeyboard(), { wrapper: StrictModeWrapper });
    await expect(result.current.hide()).resolves.toBeUndefined();
    await expect(result.current.getResizeMode()).resolves.toEqual({ mode: 'native' });
  });
});
