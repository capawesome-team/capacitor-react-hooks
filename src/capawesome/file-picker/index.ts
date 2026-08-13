import { FilePicker } from '@capawesome/capacitor-file-picker';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFilePicker = createMethodsHook('FilePicker', FilePicker, [
  'pickFiles',
  'pickDirectory',
  'pickImages',
  'pickMedia',
  'pickVideos',
  'convertHeicToJpeg',
  'copyFile',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * File access permission status with imperative `check` and `request`.
 * Only available on Android; other platforms report no restrictions.
 */
export const useFilePickerPermissions = createPermissionsHook(FilePicker);

/** Invokes `callback` when the file picker is dismissed. Only available on iOS. */
export function useFilePickerDismissed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(FilePicker, 'pickerDismissed', callback, options);
}
