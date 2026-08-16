import type { GoogleSubjectSegmentationModuleInstallProgressEvent } from '@capacitor-mlkit/subject-segmentation';
import { SubjectSegmentation } from '@capacitor-mlkit/subject-segmentation';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `processImage` separates the subject from the background in the image at the
 * given local file path and resolves with the file path of the result. It
 * requires the Google Subject Segmentation module: check for it with
 * `isGoogleSubjectSegmentationModuleAvailable` and install it with
 * `installGoogleSubjectSegmentationModule`.
 *
 * Only available on Android.
 */
export const useSubjectSegmentation = createMethodsHook(
  'SubjectSegmentation',
  SubjectSegmentation,
  [
    'processImage',
    'isGoogleSubjectSegmentationModuleAvailable',
    'installGoogleSubjectSegmentationModule',
  ],
);

/**
 * Invokes `callback` while the Google Subject Segmentation module is
 * installing.
 *
 * Only available on Android.
 */
export function useGoogleSubjectSegmentationModuleInstallProgress(
  callback: (event: GoogleSubjectSegmentationModuleInstallProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(
    SubjectSegmentation,
    'googleSubjectSegmentationModuleInstallProgress',
    callback,
    options,
  );
}
