import type {
  CallbackId,
  DownloadFileCallback,
  DownloadFileCallbackEvent,
  DownloadFileOptions,
  UploadFileCallback,
  UploadFileCallbackEvent,
  UploadFileOptions,
} from '@capacitor-firebase/storage';
import { FirebaseStorage } from '@capacitor-firebase/storage';
import { useCallback, useMemo, useState } from 'react';

import { createMethodsHook, toError, useMountedRef } from '../../core';

export interface UseUploadFileResult {
  /** The latest progress event, or `undefined` before the first one arrives. */
  event: UploadFileCallbackEvent | undefined;
  /** The error that ended the upload, or `undefined` if it is healthy. */
  error: Error | undefined;
  /** Whether an upload is currently running. */
  isTransferring: boolean;
  /**
   * Starts an upload and discards the state of the previous one. The returned
   * promise resolves as soon as the upload has started, not when it completed:
   * progress and errors are reported through `event` and `error`.
   */
  upload: (options: UploadFileOptions) => Promise<void>;
}

export interface UseDownloadFileResult {
  /** The latest progress event, or `undefined` before the first one arrives. */
  event: DownloadFileCallbackEvent | undefined;
  /** The error that ended the download, or `undefined` if it is healthy. */
  error: Error | undefined;
  /** Whether a download is currently running. */
  isTransferring: boolean;
  /**
   * Starts a download and discards the state of the previous one. The returned
   * promise resolves as soon as the download has started, not when it
   * completed: progress and errors are reported through `event` and `error`.
   */
  download: (options: DownloadFileOptions) => Promise<void>;
}

/** Plugin methods plus `isPluginAvailable`. */
export const useFirebaseStorage = createMethodsHook('FirebaseStorage', FirebaseStorage, [
  'deleteFile',
  'getDownloadUrl',
  'getMetadata',
  'listFiles',
  'updateMetadata',
]);

/**
 * Uploads a file and tracks its progress. On Web the data is passed as `blob`,
 * on Android and iOS as `uri`.
 *
 * An upload cannot be cancelled: it ends when the plugin reports a completed
 * event or an error. Events that arrive after the component has unmounted are
 * therefore ignored.
 */
export function useUploadFile(): UseUploadFileResult {
  const { event, error, isTransferring, transfer } = useTransfer(uploadFile);
  return useMemo(
    () => ({ event, error, isTransferring, upload: transfer }),
    [event, error, isTransferring, transfer],
  );
}

/**
 * Downloads a file and tracks its progress. On Android and iOS the file is
 * written to the `uri` given in the options, on Web the completed event carries
 * the file as `blob`.
 *
 * A download cannot be cancelled: it ends when the plugin reports a completed
 * event or an error. Events that arrive after the component has unmounted are
 * therefore ignored.
 */
export function useDownloadFile(): UseDownloadFileResult {
  const { event, error, isTransferring, transfer } = useTransfer(downloadFile);
  return useMemo(
    () => ({ event, error, isTransferring, download: transfer }),
    [event, error, isTransferring, transfer],
  );
}

interface TransferEvent {
  completed: boolean;
}

interface UseTransferResult<TOptions, TEvent> {
  event: TEvent | undefined;
  error: Error | undefined;
  isTransferring: boolean;
  transfer: (options: TOptions) => Promise<void>;
}

/**
 * Keeps the latest progress event and the latest in-band error of a transfer.
 * The transfer callback has no remover, so it is left running and its events
 * are dropped once the component has unmounted. `startTransfer` must be
 * referentially stable.
 */
function useTransfer<TOptions, TEvent extends TransferEvent>(
  startTransfer: (
    options: TOptions,
    callback: (event: TEvent | null, error: unknown) => void,
  ) => Promise<CallbackId>,
): UseTransferResult<TOptions, TEvent> {
  const [event, setEvent] = useState<TEvent>();
  const [error, setError] = useState<Error>();
  const [isTransferring, setIsTransferring] = useState(false);
  const mountedRef = useMountedRef();
  const transfer = useCallback(
    async (options: TOptions) => {
      setEvent(undefined);
      setError(undefined);
      setIsTransferring(true);
      try {
        await startTransfer(options, (nextEvent, nextError) => {
          if (!mountedRef.current) {
            return;
          }
          if (nextError) {
            setError(toError(nextError));
            setIsTransferring(false);
          } else if (nextEvent) {
            setEvent(nextEvent);
            if (nextEvent.completed) {
              setIsTransferring(false);
            }
          }
        });
      } catch (caught) {
        if (mountedRef.current) {
          setError(toError(caught));
          setIsTransferring(false);
        }
      }
    },
    [startTransfer, mountedRef],
  );
  return { event, error, isTransferring, transfer };
}

function uploadFile(options: UploadFileOptions, callback: UploadFileCallback): Promise<CallbackId> {
  return FirebaseStorage.uploadFile(options, callback);
}

function downloadFile(
  options: DownloadFileOptions,
  callback: DownloadFileCallback,
): Promise<CallbackId> {
  return FirebaseStorage.downloadFile(options, callback);
}
