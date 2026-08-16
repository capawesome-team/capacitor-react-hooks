import type {
  BoundaryEvent,
  EndEvent,
  ErrorEvent,
  StartEvent,
} from '@capawesome-team/capacitor-speech-synthesis';
import { SpeechSynthesis } from '@capawesome-team/capacitor-speech-synthesis';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` and `synthesizeToFile` are only available on Android and iOS.
 */
export const useSpeechSynthesis = createMethodsHook('SpeechSynthesis', SpeechSynthesis, [
  'cancel',
  'getLanguages',
  'getVoices',
  'initialize',
  'isAvailable',
  'isSpeaking',
  'isLanguageAvailable',
  'isVoiceAvailable',
  'pause',
  'resume',
  'speak',
  'synthesizeToFile',
]);

/**
 * Invokes `callback` whenever the spoken utterance reaches a word boundary.
 * The event is emitted for every spoken word.
 */
export function useSpeechSynthesisBoundary(
  callback: (event: BoundaryEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechSynthesis, 'boundary', callback, options);
}

/** Invokes `callback` when an utterance has started. */
export function useSpeechSynthesisStart(
  callback: (event: StartEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechSynthesis, 'start', callback, options);
}

/** Invokes `callback` when an utterance has finished. */
export function useSpeechSynthesisEnd(
  callback: (event: EndEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechSynthesis, 'end', callback, options);
}

/** Invokes `callback` whenever an error occurs during speech synthesis. */
export function useSpeechSynthesisError(
  callback: (event: ErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechSynthesis, 'error', callback, options);
}
