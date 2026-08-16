import { AudioPlayer } from '@capawesome-team/capacitor-audio-player';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useAudioPlayer = createMethodsHook('AudioPlayer', AudioPlayer, [
  'getCurrentPosition',
  'getDuration',
  'isPlaying',
  'pause',
  'play',
  'resume',
  'seekTo',
  'setRate',
  'setVolume',
  'stop',
]);

/**
 * Invokes `callback` whenever the audio has stopped playing, either because it
 * reached the end or because `stop` was called.
 */
export function useAudioPlayerStop(callback: () => void, options?: ListenerOptions): void {
  usePluginListener(AudioPlayer, 'stop', callback, options);
}
