import type {
  AudioSessionOutput,
  InterruptionEvent,
  RouteChangeEvent,
} from '@capawesome/capacitor-audio-session';
import { AudioSession } from '@capawesome/capacitor-audio-session';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on iOS.
 */
export const useAudioSession = createMethodsHook('AudioSession', AudioSession, [
  'configure',
  'getCurrentOutputs',
  'overrideOutput',
  'setActive',
]);

const subscribeToRouteChange = pluginEventSubscription<RouteChangeEvent>(
  AudioSession,
  'routeChange',
);

/**
 * The audio outputs of the current audio route, kept in sync via a single
 * shared plugin listener. `undefined` until the initial outputs resolve.
 *
 * Only available on iOS.
 */
export const useAudioSessionCurrentOutputs = createPluginStateHook<AudioSessionOutput[]>({
  load: async () => (await AudioSession.getCurrentOutputs()).outputs,
  subscribe: emit => subscribeToRouteChange(event => emit(event.outputs)),
});

/**
 * Invokes `callback` when the audio session is interrupted, e.g. by an incoming
 * phone call.
 *
 * Only available on iOS.
 */
export function useAudioSessionInterruption(
  callback: (event: InterruptionEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AudioSession, 'interruption', callback, options);
}

/**
 * Invokes `callback` when the audio route changes, e.g. when headphones are
 * plugged in or out.
 *
 * Only available on iOS.
 */
export function useAudioSessionRouteChange(
  callback: (event: RouteChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AudioSession, 'routeChange', callback, options);
}
