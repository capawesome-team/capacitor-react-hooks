import type {
  TransferCompletedEvent,
  TransferFailedEvent,
  TransferProgressEvent,
} from '@capawesome-team/capacitor-file-transfer';
import { FileTransfer } from '@capawesome-team/capacitor-file-transfer';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFileTransfer = createMethodsHook('FileTransfer', FileTransfer, [
  'cancelTransferById',
  'checkPermissions',
  'getTransferById',
  'getTransfers',
  'pauseTransferById',
  'requestPermissions',
  'resumeTransferById',
  'startDownload',
  'startUpload',
]);

/**
 * Status of the permission to post the progress notification with imperative
 * `check` and `request`.
 *
 * Transfers also run without the permission, only the progress notification is
 * not shown. On Android 12 and older, on iOS and on the web, the permission is
 * always granted.
 */
export const useFileTransferPermissions = createPermissionsHook(FileTransfer);

/**
 * Invokes `callback` whenever a transfer completes successfully.
 *
 * The listener is global: it receives the events of every transfer, so match
 * `event.id` against the identifier returned by `startDownload(...)` or
 * `startUpload(...)` to follow a single transfer. Events that occur while no
 * listener is registered are retained and delivered once a listener is added.
 */
export function useTransferCompleted(
  callback: (event: TransferCompletedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FileTransfer, 'transferCompleted', callback, options);
}

/**
 * Invokes `callback` whenever a transfer fails.
 *
 * The listener is global: it receives the events of every transfer, so match
 * `event.id` against the identifier returned by `startDownload(...)` or
 * `startUpload(...)` to follow a single transfer. Events that occur while no
 * listener is registered are retained and delivered once a listener is added.
 */
export function useTransferFailed(
  callback: (event: TransferFailedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FileTransfer, 'transferFailed', callback, options);
}

/**
 * Invokes `callback` repeatedly while a transfer is running.
 *
 * The listener is global: it receives the events of every transfer, so match
 * `event.id` against the identifier returned by `startDownload(...)` or
 * `startUpload(...)` to follow a single transfer. The throttling of roughly one
 * event every 100 milliseconds is applied per transfer, so concurrent
 * transfers emit independently and the callback is invoked more often than
 * every 100 milliseconds overall.
 */
export function useTransferProgress(
  callback: (event: TransferProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FileTransfer, 'transferProgress', callback, options);
}
