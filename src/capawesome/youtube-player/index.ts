import type {
  CurrentTimeChangeEvent,
  FullscreenChangeEvent,
  PlaybackRateChangeEvent,
  PlayerErrorEvent,
  PlayerReadyEvent,
  PlayerStateChangeEvent,
} from '@capawesome/capacitor-youtube-player';
import { YoutubePlayer } from '@capawesome/capacitor-youtube-player';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useYoutubePlayer = createMethodsHook('YoutubePlayer', YoutubePlayer, [
  'createPlayer',
  'cueVideo',
  'getCurrentTime',
  'getDuration',
  'loadVideo',
  'mute',
  'pause',
  'play',
  'removePlayer',
  'seekTo',
  'setPlaybackRate',
  'setPlayerFrame',
  'setVolume',
  'unmute',
]);

/**
 * Invokes `callback` whenever the current playback time of a player changes.
 * The event is emitted multiple times per second during playback.
 */
export function useYoutubePlayerCurrentTimeChange(
  callback: (event: CurrentTimeChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'currentTimeChange', callback, options);
}

/**
 * Invokes `callback` whenever a player enters or exits fullscreen.
 *
 * Only available on Android and Web.
 */
export function useYoutubePlayerFullscreenChange(
  callback: (event: FullscreenChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'fullscreenChange', callback, options);
}

/** Invokes `callback` whenever the playback rate of a player changes. */
export function useYoutubePlayerPlaybackRateChange(
  callback: (event: PlaybackRateChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'playbackRateChange', callback, options);
}

/** Invokes `callback` whenever an error occurs in a player. */
export function useYoutubePlayerError(
  callback: (event: PlayerErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'playerError', callback, options);
}

/**
 * Invokes `callback` when a player has finished loading and is ready to receive
 * commands.
 */
export function useYoutubePlayerReady(
  callback: (event: PlayerReadyEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'playerReady', callback, options);
}

/** Invokes `callback` whenever the state of a player changes. */
export function useYoutubePlayerStateChange(
  callback: (event: PlayerStateChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(YoutubePlayer, 'playerStateChange', callback, options);
}
