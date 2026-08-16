import type {
  AvailabilityChangeEvent,
  AvailabilityStatus,
  DownloadProgressEvent,
  StreamTextOptions,
  TextChunkEvent,
} from '@capawesome-team/capacitor-llm';
import { Llm } from '@capawesome-team/capacitor-llm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardCancelError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS. `downloadModel` is only available on
 * Android.
 */
export const useLlm = createMethodsHook('Llm', Llm, [
  'cancelGeneration',
  'createChat',
  'deleteChat',
  'downloadModel',
  'generateText',
  'getAvailability',
  'streamText',
]);

const subscribeToAvailabilityChange = pluginEventSubscription<AvailabilityChangeEvent>(
  Llm,
  'availabilityChange',
);

/**
 * The availability status of the on-device model, kept in sync via a single
 * shared plugin listener. `undefined` until the initial status resolves.
 */
export const useLlmAvailability = createPluginStateHook<AvailabilityStatus>({
  load: async () => (await Llm.getAvailability()).status,
  subscribe: emit => subscribeToAvailabilityChange(event => emit(event.status)),
});

/** The state and controls of a streaming generation. */
export interface UseLlmTextStreamSessionResult {
  /**
   * Starts a streaming generation in the given chat. Rejects when the
   * generation fails or is canceled.
   */
  start: (options: StreamTextOptions) => Promise<void>;
  /** Cancels the running generation, which makes `start` reject. */
  cancel: () => Promise<void>;
  isGenerating: boolean;
  /** The text generated so far; empty until the first chunk arrives. */
  text: string;
}

/**
 * A streaming generation bound to the component lifecycle: `start` streams the
 * response of a prompt and accumulates the `textChunk` events into `text`,
 * `cancel` stops it. Unmounting while generating cancels the generation.
 *
 * Create the chat with `createChat` first and pass its identifier to `start`.
 * Only one generation can be in flight per chat at a time.
 *
 * Only available on Android and iOS.
 */
export function useLlmTextStreamSession(): UseLlmTextStreamSessionResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState('');
  const chatIdRef = useRef<string | undefined>(undefined);
  const isGeneratingRef = useRef(false);
  const mountedRef = useMountedRef();

  // Attached for the lifetime of the component so that no chunk of a fast
  // generation is missed while the listener is still being registered.
  usePluginListener<TextChunkEvent>(Llm, 'textChunk', event => {
    if (event.chatId === chatIdRef.current) {
      setText(current => current + event.text);
    }
  });

  const setGenerating = useCallback(
    (next: boolean) => {
      isGeneratingRef.current = next;
      if (mountedRef.current) {
        setIsGenerating(next);
      }
    },
    [mountedRef],
  );

  const start = useCallback(
    async (options: StreamTextOptions) => {
      chatIdRef.current = options.chatId;
      setText('');
      setGenerating(true);
      try {
        const result = await Llm.streamText(options);
        if (mountedRef.current) {
          setText(result.text);
        }
      } finally {
        setGenerating(false);
      }
    },
    [mountedRef, setGenerating],
  );

  const cancel = useCallback(async () => {
    const chatId = chatIdRef.current;
    if (!chatId) {
      return;
    }
    setGenerating(false);
    await Llm.cancelGeneration({ chatId });
  }, [setGenerating]);

  useEffect(
    () => () => {
      const chatId = chatIdRef.current;
      if (!isGeneratingRef.current || !chatId) {
        return;
      }
      isGeneratingRef.current = false;
      void Llm.cancelGeneration({ chatId }).catch(discardCancelError);
    },
    [],
  );

  return useMemo(
    () => ({ start, cancel, isGenerating, text }),
    [start, cancel, isGenerating, text],
  );
}

/**
 * Invokes `callback` whenever the availability status of the on-device model
 * changes. The plugin watches the status only while a listener is attached.
 *
 * Only available on Android and iOS.
 */
export function useLlmAvailabilityChange(
  callback: (event: AvailabilityChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Llm, 'availabilityChange', callback, options);
}

/**
 * Invokes `callback` while the on-device model is being downloaded with
 * `downloadModel`.
 *
 * Only available on Android.
 */
export function useLlmDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Llm, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` for every text chunk of a generation started with
 * `streamText`. Append the chunks in the order they are received to
 * reconstruct the complete response, or use `useLlmTextStreamSession`, which
 * does both.
 *
 * Only available on Android and iOS.
 */
export function useLlmTextChunk(
  callback: (event: TextChunkEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Llm, 'textChunk', callback, options);
}
