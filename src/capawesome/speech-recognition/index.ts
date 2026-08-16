import type {
  ErrorEvent,
  PartialResultEvent,
  ResultEvent,
  SoundLevelEvent,
  StartListeningOptions,
  StopListeningOptions,
} from '@capawesome-team/capacitor-speech-recognition';
import { SpeechRecognition } from '@capawesome-team/capacitor-speech-recognition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardStopError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Platform support differs per method: `getLanguages` is only available on
 * Android and iOS, `getOnDeviceLanguages` and `downloadOnDeviceLanguage` are
 * only available on Android (SDK 33+) and iOS (26+).
 */
export const useSpeechRecognition = createMethodsHook('SpeechRecognition', SpeechRecognition, [
  'getLanguages',
  'getOnDeviceLanguages',
  'downloadOnDeviceLanguage',
  'isAvailable',
  'isListening',
  'startListening',
  'stopListening',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Audio recording and speech recognition permission status with imperative
 * `check` and `request`.
 */
export const useSpeechRecognitionPermissions = createPermissionsHook(SpeechRecognition);

export interface UseSpeechRecognitionSessionResult {
  /** Starts a listening session. Rejects if the session cannot be started. */
  start: (options?: StartListeningOptions) => Promise<void>;
  /** Stops the running listening session. */
  stop: (options?: StopListeningOptions) => Promise<void>;
  isListening: boolean;
  /** The transcript of the most recent result; `undefined` until the first result. */
  result: string | undefined;
}

/**
 * A listening session bound to the component lifecycle: `start` attaches the
 * `result` listener and starts listening, `stop` reverses both. Unmounting
 * while listening stops the session.
 *
 * The recognizer can also end the session on its own, for example once the
 * silence threshold is reached, which sets `isListening` back to `false`.
 */
export function useSpeechRecognitionSession(): UseSpeechRecognitionSessionResult {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string>();
  const isListeningRef = useRef(false);
  const mountedRef = useMountedRef();

  const setListening = useCallback(
    (next: boolean) => {
      isListeningRef.current = next;
      if (mountedRef.current) {
        setIsListening(next);
      }
    },
    [mountedRef],
  );

  usePluginListener<ResultEvent>(SpeechRecognition, 'result', event => setResult(event.result), {
    enabled: isListening,
  });
  usePluginListener<void>(SpeechRecognition, 'end', () => setListening(false), {
    enabled: isListening,
  });

  const start = useCallback(
    async (options?: StartListeningOptions) => {
      setResult(undefined);
      setListening(true);
      try {
        await SpeechRecognition.startListening(options);
      } catch (error) {
        setListening(false);
        throw error;
      }
    },
    [setListening],
  );

  const stop = useCallback(
    async (options?: StopListeningOptions) => {
      setListening(false);
      await SpeechRecognition.stopListening(options);
    },
    [setListening],
  );

  useEffect(
    () => () => {
      if (!isListeningRef.current) {
        return;
      }
      isListeningRef.current = false;
      void SpeechRecognition.stopListening().catch(discardStopError);
    },
    [],
  );

  return useMemo(() => ({ start, stop, isListening, result }), [start, stop, isListening, result]);
}

/** Invokes `callback` when the speech recognizer has started listening. */
export function useSpeechRecognitionStart(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(SpeechRecognition, 'start', callback, options);
}

/** Invokes `callback` when the speech recognizer has stopped listening. */
export function useSpeechRecognitionEnd(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(SpeechRecognition, 'end', callback, options);
}

/**
 * Invokes `callback` when the user has started to speak.
 *
 * Only available on Android and Web.
 */
export function useSpeechRecognitionSpeechStart(
  callback: () => void,
  options?: ListenerOptions,
): void {
  usePluginListener<void>(SpeechRecognition, 'speechStart', callback, options);
}

/**
 * Invokes `callback` when the user has stopped speaking.
 *
 * Only available on Android and Web.
 */
export function useSpeechRecognitionSpeechEnd(
  callback: () => void,
  options?: ListenerOptions,
): void {
  usePluginListener<void>(SpeechRecognition, 'speechEnd', callback, options);
}

/**
 * Invokes `callback` with the intermediate transcript while the user is
 * speaking. The transcript is not final and can change with the next event.
 */
export function useSpeechRecognitionPartialResult(
  callback: (event: PartialResultEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechRecognition, 'partialResult', callback, options);
}

/** Invokes `callback` with the final transcript of the recognized speech. */
export function useSpeechRecognitionResult(
  callback: (event: ResultEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechRecognition, 'result', callback, options);
}

/**
 * Invokes `callback` whenever the sound level of the audio signal changes.
 * There is no guarantee that the event is emitted at all.
 *
 * Only available on Android and iOS.
 */
export function useSpeechRecognitionSoundLevel(
  callback: (event: SoundLevelEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechRecognition, 'soundLevel', callback, options);
}

/** Invokes `callback` whenever an error occurs during speech recognition. */
export function useSpeechRecognitionError(
  callback: (event: ErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SpeechRecognition, 'error', callback, options);
}
