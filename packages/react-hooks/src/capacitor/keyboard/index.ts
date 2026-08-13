import type { KeyboardInfo } from '@capacitor/keyboard';
import { Keyboard } from '@capacitor/keyboard';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

export interface KeyboardState {
  isVisible: boolean;
  /** Height of the keyboard in pixels; `0` while the keyboard is hidden. */
  height: number;
}

/** Plugin methods plus `isAvailable`. */
export const useKeyboard = createMethodsHook('Keyboard', Keyboard, [
  'show',
  'hide',
  'setAccessoryBarVisible',
  'setScroll',
  'setStyle',
  'setResizeMode',
  'getResizeMode',
]);

/**
 * The current keyboard visibility and height, composed from the
 * `keyboardWillShow` and `keyboardWillHide` events. The plugin has no getter,
 * so the state stays `undefined` until the keyboard is shown or hidden once.
 */
export const useKeyboardState = createPluginStateHook<KeyboardState>({
  subscribe: emit => {
    const unsubscribeFromShow = pluginEventSubscription<KeyboardInfo>(
      Keyboard,
      'keyboardWillShow',
    )(info => emit({ isVisible: true, height: info.keyboardHeight }));
    const unsubscribeFromHide = pluginEventSubscription<void>(
      Keyboard,
      'keyboardWillHide',
    )(() => emit({ isVisible: false, height: 0 }));
    return () => {
      unsubscribeFromShow();
      unsubscribeFromHide();
    };
  },
});

/** Invokes `callback` when the keyboard is about to be shown. */
export function useKeyboardWillShow(
  callback: (info: KeyboardInfo) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Keyboard, 'keyboardWillShow', callback, options);
}

/** Invokes `callback` when the keyboard has been shown. */
export function useKeyboardDidShow(
  callback: (info: KeyboardInfo) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Keyboard, 'keyboardDidShow', callback, options);
}

/** Invokes `callback` when the keyboard is about to be hidden. */
export function useKeyboardWillHide(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Keyboard, 'keyboardWillHide', callback, options);
}

/** Invokes `callback` when the keyboard has been hidden. */
export function useKeyboardDidHide(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Keyboard, 'keyboardDidHide', callback, options);
}
