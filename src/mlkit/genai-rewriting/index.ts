import type {
  DownloadProgressEvent,
  InferenceProgressEvent,
} from '@capacitor-mlkit/genai-rewriting';
import { GenAiRewriting } from '@capacitor-mlkit/genai-rewriting';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The feature availability depends on the output type and language, so
 * `checkFeatureStatus()` and `downloadFeature()` have to be called with the
 * same options as `rewrite()`.
 *
 * Only available on Android.
 */
export const useGenaiRewriting = createMethodsHook('GenAiRewriting', GenAiRewriting, [
  'checkFeatureStatus',
  'downloadFeature',
  'rewrite',
]);

/**
 * Invokes `callback` while the rewriting feature is being downloaded with
 * `downloadFeature`. The event only reports the bytes downloaded so far, not
 * the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiRewritingDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiRewriting, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` with every partial result while `rewrite` is running,
 * which allows rendering the rewritten text as it is generated. The complete
 * result is the resolved value of `rewrite`.
 *
 * Only available on Android.
 */
export function useGenaiRewritingInferenceProgress(
  callback: (event: InferenceProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiRewriting, 'inferenceProgress', callback, options);
}
