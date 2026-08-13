import type { ProgressStatus } from '@capacitor/file-transfer';
import { FileTransfer } from '@capacitor/file-transfer';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useFileTransfer = createMethodsHook('FileTransfer', FileTransfer, [
  'downloadFile',
  'uploadFile',
]);

/**
 * Invokes `callback` with the progress of a running transfer. Progress is only
 * reported for transfers started with `progress: true`.
 *
 * The `progress` event is global to the plugin, not scoped to a single call:
 * one listener receives the events of every ongoing download and upload. Tell
 * concurrent transfers apart by the `url` and `type` fields of the event.
 */
export function useFileTransferProgress(
  callback: (progress: ProgressStatus) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FileTransfer, 'progress', callback, options);
}
