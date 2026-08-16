import type {
  DownloadProgressEvent,
  InferenceProgressEvent,
} from '@capacitor-mlkit/genai-summarization';
import { GenAiSummarization } from '@capacitor-mlkit/genai-summarization';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The feature availability depends on the input type, output type and language,
 * so `checkFeatureStatus()` and `downloadFeature()` have to be called with the
 * same options as `summarize()`.
 *
 * Only available on Android.
 */
export const useGenaiSummarization = createMethodsHook('GenAiSummarization', GenAiSummarization, [
  'checkFeatureStatus',
  'downloadFeature',
  'summarize',
]);

/**
 * Invokes `callback` while the summarization feature is being downloaded with
 * `downloadFeature`. The event only reports the bytes downloaded so far, not
 * the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiSummarizationDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSummarization, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` with every partial result while `summarize` is running,
 * which allows rendering the summary as it is generated. The complete result
 * is the resolved value of `summarize`.
 *
 * Only available on Android.
 */
export function useGenaiSummarizationInferenceProgress(
  callback: (event: InferenceProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiSummarization, 'inferenceProgress', callback, options);
}
