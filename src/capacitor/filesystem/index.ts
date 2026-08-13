import { Filesystem } from '@capacitor/filesystem';

import { createMethodsHook, createPermissionsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFilesystem = createMethodsHook('Filesystem', Filesystem, [
  'readFile',
  'readFileInChunks',
  'writeFile',
  'appendFile',
  'deleteFile',
  'mkdir',
  'rmdir',
  'readdir',
  'getUri',
  'stat',
  'rename',
  'copy',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Filesystem permission status with imperative `check` and `request`.
 * Only required on Android and only for `Directory.Documents` and
 * `Directory.ExternalStorage`.
 */
export const useFilesystemPermissions = createPermissionsHook(Filesystem);
