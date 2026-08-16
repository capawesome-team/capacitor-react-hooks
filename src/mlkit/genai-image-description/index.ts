import type {
  DownloadProgressEvent,
  InferenceProgressEvent,
} from '@capacitor-mlkit/genai-image-description';
import { GenAiImageDescription } from '@capacitor-mlkit/genai-image-description';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Check `checkFeatureStatus()` before describing an image: if the feature is
 * `DOWNLOADABLE`, it has to be downloaded with `downloadFeature()` first.
 *
 * Only available on Android.
 */
export const useGenaiImageDescription = createMethodsHook(
  'GenAiImageDescription',
  GenAiImageDescription,
  ['checkFeatureStatus', 'describeImage', 'downloadFeature'],
);

/**
 * Invokes `callback` while the image description feature is being downloaded
 * with `downloadFeature`. The event only reports the bytes downloaded so far,
 * not the total download size, so a percentage cannot be computed.
 *
 * Only available on Android.
 */
export function useGenaiImageDescriptionDownloadProgress(
  callback: (event: DownloadProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiImageDescription, 'downloadProgress', callback, options);
}

/**
 * Invokes `callback` with every partial result while `describeImage` is
 * running, which allows rendering the description as it is generated. The
 * complete result is the resolved value of `describeImage`.
 *
 * Only available on Android.
 */
export function useGenaiImageDescriptionInferenceProgress(
  callback: (event: InferenceProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(GenAiImageDescription, 'inferenceProgress', callback, options);
}
