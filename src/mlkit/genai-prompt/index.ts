import type { DownloadProgressEvent, InferenceProgressEvent } from '@capacitor-mlkit/genai-prompt';
import { GenAiPrompt } from '@capacitor-mlkit/genai-prompt';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Check `checkFeatureStatus()` before generating content: if the feature is
 * `DOWNLOADABLE`, it has to be downloaded with `downloadFeature()` first.
 *
 * Only available on Android.
 */
export const useGenaiPrompt = createMethodsHook('GenAiPrompt', GenAiPrompt, [
  'checkFeatureStatus',
  'downloadFeature',
  'generateContent',
]);

/**
 * Invokes `callback` while the prompt feature is being downloaded with
 * `downloadFeature`. The event only reports the bytes downloaded so far, not
 * the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiPromptDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiPrompt, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` with every partial result while `generateContent` is
 * running, which allows rendering the response as it is generated. The
 * complete result is the resolved value of `generateContent`.
 *
 * Only available on Android.
 */
export function useGenaiPromptInferenceProgress(
  callback: (event: InferenceProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiPrompt, 'inferenceProgress', callback, options);
}
