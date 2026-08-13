import type { AccelListenerEvent, OrientationListenerEvent } from '@capacitor/motion';
import { Motion } from '@capacitor/motion';

import { usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Invokes `callback` with the device acceleration and rotation rate.
 *
 * The event fires at a very high frequency (tens of times per second):
 * throttle inside `callback` and avoid a `setState` call per event, otherwise
 * the component re-renders on every sensor sample.
 */
export function useMotionAccel(
  callback: (event: AccelListenerEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Motion, 'accel', callback, options);
}

/**
 * Invokes `callback` when the device orientation changes.
 *
 * The event fires at a very high frequency (tens of times per second):
 * throttle inside `callback` and avoid a `setState` call per event, otherwise
 * the component re-renders on every sensor sample.
 */
export function useMotionOrientation(
  callback: (event: OrientationListenerEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Motion, 'orientation', callback, options);
}
