import type {
  DownloadProgressEvent,
  InferenceProgressEvent,
} from '@capacitor-mlkit/genai-proofreading';
import { GenAiProofreading } from '@capacitor-mlkit/genai-proofreading';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The feature availability depends on the input type and language, so
 * `checkFeatureStatus()` and `downloadFeature()` have to be called with the
 * same options as `proofread()`.
 *
 * Only available on Android.
 */
export const useGenaiProofreading = createMethodsHook('GenAiProofreading', GenAiProofreading, [
  'checkFeatureStatus',
  'downloadFeature',
  'proofread',
]);

/**
 * Invokes `callback` while the proofreading feature is being downloaded with
 * `downloadFeature`. The event only reports the bytes downloaded so far, not
 * the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiProofreadingDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiProofreading, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` with every partial result while `proofread` is running,
 * which allows rendering the suggestion as it is generated. The complete
 * result is the resolved value of `proofread`.
 *
 * Only available on Android.
 */
export function useGenaiProofreadingInferenceProgress(
  callback: (event: InferenceProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiProofreading, 'inferenceProgress', callback, options);
}
