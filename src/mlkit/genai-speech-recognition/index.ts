import type {
  DownloadProgressEvent,
  ErrorEvent,
  RecognitionResultEvent,
  StartRecognitionOptions,
} from '@capacitor-mlkit/genai-speech-recognition';
import { GenAiSpeechRecognition } from '@capacitor-mlkit/genai-speech-recognition';
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
 * The feature availability depends on the recognition mode and locale, so
 * `checkFeatureStatus()` and `downloadFeature()` have to be called with the
 * same options as `startRecognition()`.
 *
 * Only available on Android.
 */
export const useGenaiSpeechRecognition = createMethodsHook(
  'GenAiSpeechRecognition',
  GenAiSpeechRecognition,
  [
    'checkFeatureStatus',
    'checkPermissions',
    'downloadFeature',
    'requestPermissions',
    'startRecognition',
    'stopRecognition',
  ],
);

/**
 * Microphone permission status with imperative `check` and `request`.
 *
 * Only available on Android.
 */
export const useGenaiSpeechRecognitionPermissions = createPermissionsHook(GenAiSpeechRecognition);

export interface UseGenaiSpeechRecognitionSessionResult {
  /** Starts a recognition session. Rejects if the session cannot be started. */
  start: (options?: StartRecognitionOptions) => Promise<void>;
  /** Stops the running recognition session. */
  stop: () => Promise<void>;
  isListening: boolean;
  /** The most recent final result; `undefined` until the first one arrives. */
  result: string | undefined;
}

/**
 * A recognition session bound to the component lifecycle: `start` attaches the
 * `finalResult` listener and starts the recognition, `stop` reverses both.
 * Unmounting while listening stops the session.
 *
 * Errors of a running session are reported via `useGenaiSpeechRecognitionError`
 * and intermediate transcripts via `useGenaiSpeechRecognitionPartialResult`.
 *
 * Only available on Android.
 */
export function useGenaiSpeechRecognitionSession(): UseGenaiSpeechRecognitionSessionResult {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string>();
  const isListeningRef = useRef(false);
  const mountedRef = useMountedRef();

  usePluginListener<RecognitionResultEvent>(
    GenAiSpeechRecognition,
    'finalResult',
    event => setResult(event.text),
    { enabled: isListening },
  );

  const setListening = useCallback(
    (next: boolean) => {
      isListeningRef.current = next;
      if (mountedRef.current) {
        setIsListening(next);
      }
    },
    [mountedRef],
  );

  const start = useCallback(
    async (options?: StartRecognitionOptions) => {
      setResult(undefined);
      setListening(true);
      try {
        await GenAiSpeechRecognition.startRecognition(options);
      } catch (error) {
        setListening(false);
        throw error;
      }
    },
    [setListening],
  );

  const stop = useCallback(async () => {
    setListening(false);
    await GenAiSpeechRecognition.stopRecognition();
  }, [setListening]);

  useEffect(
    () => () => {
      if (!isListeningRef.current) {
        return;
      }
      isListeningRef.current = false;
      void GenAiSpeechRecognition.stopRecognition().catch(discardStopError);
    },
    [],
  );

  return useMemo(() => ({ start, stop, isListening, result }), [start, stop, isListening, result]);
}

/**
 * Invokes `callback` while the speech recognition feature is being downloaded
 * with `downloadFeature`. The event only reports the bytes downloaded so far,
 * not the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiSpeechRecognitionDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSpeechRecognition, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` whenever an error occurs during a recognition session.
 *
 * Only available on Android.
 */
export function useGenaiSpeechRecognitionError(
  callback: (event: ErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSpeechRecognition, 'error', callback, options);
}

/**
 * Invokes `callback` with the final transcript of the recognized speech.
 *
 * Only available on Android.
 */
export function useGenaiSpeechRecognitionFinalResult(
  callback: (event: RecognitionResultEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSpeechRecognition, 'finalResult', callback, options);
}

/**
 * Invokes `callback` with the intermediate transcript while the user is
 * speaking. The transcript is not final and can change with the next event.
 *
 * Only available on Android.
 */
export function useGenaiSpeechRecognitionPartialResult(
  callback: (event: RecognitionResultEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSpeechRecognition, 'partialResult', callback, options);
}
