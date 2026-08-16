import type { OperationProgressEvent } from '@capawesome-team/capacitor-file-manager';
import { FileManager } from '@capawesome-team/capacitor-file-manager';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFileManager = createMethodsHook('FileManager', FileManager, [
  'appendFile',
  'cancelOperationById',
  'clearCache',
  'clearDirectory',
  'copyDirectory',
  'copyFile',
  'createDirectory',
  'deleteDirectory',
  'deleteFile',
  'exists',
  'getAppStorageInfo',
  'getDeviceStorageInfo',
  'getDirectorySize',
  'getFileChecksum',
  'getMetadata',
  'getPersistedDirectories',
  'getUri',
  'moveDirectory',
  'moveFile',
  'persistDirectoryAccess',
  'readDirectory',
  'readFile',
  'readFileAsBlob',
  'releaseDirectoryAccess',
  'truncateFile',
  'writeFile',
]);

/**
 * Invokes `callback` whenever a directory operation reports progress.
 *
 * The listener receives the events of every running operation. Pass an `id` to
 * the operation and match it against `event.id` to tell them apart; the
 * identifier is `null` if the operation was started without one.
 */
export function useOperationProgress(
  callback: (event: OperationProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FileManager, 'operationProgress', callback, options);
}
