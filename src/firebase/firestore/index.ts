import type {
  AddCollectionSnapshotListenerCallback,
  AddCollectionSnapshotListenerOptions,
  AddDocumentSnapshotListenerCallback,
  AddDocumentSnapshotListenerOptions,
  CallbackId,
  DocumentData,
  DocumentSnapshot,
  GetCollectionResult,
  GetDocumentResult,
} from '@capacitor-firebase/firestore';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { useCallback, useMemo, useState } from 'react';

import { createMethodsHook, toError, useCallbackIdSubscription } from '../../core';

/** Snapshot listener options without the document reference. */
export type UseDocumentSnapshotOptions = Omit<AddDocumentSnapshotListenerOptions, 'reference'>;

/** Snapshot listener options without the collection reference. */
export type UseCollectionSnapshotOptions = Omit<AddCollectionSnapshotListenerOptions, 'reference'>;

export interface UseDocumentSnapshotResult<T> {
  /** The latest document snapshot, or `undefined` until the first one arrives. */
  snapshot: DocumentSnapshot<T> | undefined;
  /** The latest listener error, or `undefined` if the listener is healthy. */
  error: Error | undefined;
}

export interface UseCollectionSnapshotResult<T> {
  /** The latest collection snapshots, or `undefined` until the first ones arrive. */
  snapshots: DocumentSnapshot<T>[] | undefined;
  /** The latest listener error, or `undefined` if the listener is healthy. */
  error: Error | undefined;
}

/** Plugin methods plus `isPluginAvailable`. */
export const useFirebaseFirestore = createMethodsHook('FirebaseFirestore', FirebaseFirestore, [
  'addDocument',
  'deleteDocument',
  'getCollection',
  'getCollectionGroup',
  'getCountFromServer',
  'getDocument',
  'setDocument',
  'updateDocument',
  'writeBatch',
]);

/**
 * Subscribes to the document referred to by `reference` for the lifetime of the
 * component and resubscribes whenever the reference or the options change.
 * Errors reported by the listener are exposed as `error` instead of being
 * thrown.
 */
export function useDocumentSnapshot<T extends DocumentData = DocumentData>(
  reference: string,
  options?: UseDocumentSnapshotOptions,
): UseDocumentSnapshotResult<T> {
  const listenerOptions = useStableOptions<AddDocumentSnapshotListenerOptions>({
    ...options,
    reference,
  });
  const start = useCallback(
    (callback: AddDocumentSnapshotListenerCallback<T>) =>
      FirebaseFirestore.addDocumentSnapshotListener<T>(listenerOptions, callback),
    [listenerOptions],
  );
  const { event, error } = useSnapshotSubscription<GetDocumentResult<T>>(start);
  return { snapshot: event?.snapshot, error };
}

/**
 * Subscribes to the collection referred to by `reference` for the lifetime of
 * the component and resubscribes whenever the reference or the options change.
 * Errors reported by the listener are exposed as `error` instead of being
 * thrown.
 */
export function useCollectionSnapshot<T extends DocumentData = DocumentData>(
  reference: string,
  options?: UseCollectionSnapshotOptions,
): UseCollectionSnapshotResult<T> {
  const listenerOptions = useStableOptions<AddCollectionSnapshotListenerOptions>({
    ...options,
    reference,
  });
  const start = useCallback(
    (callback: AddCollectionSnapshotListenerCallback<T>) =>
      FirebaseFirestore.addCollectionSnapshotListener<T>(listenerOptions, callback),
    [listenerOptions],
  );
  const { event, error } = useSnapshotSubscription<GetCollectionResult<T>>(start);
  return { snapshots: event?.snapshots, error };
}

/**
 * Keeps the latest snapshot event and the latest in-band error of a snapshot
 * listener. `start` must be referentially stable.
 */
function useSnapshotSubscription<TEvent>(
  start: (callback: (event: TEvent | null, error: unknown) => void) => Promise<CallbackId>,
): { event: TEvent | undefined; error: Error | undefined } {
  const [event, setEvent] = useState<TEvent>();
  const [error, setError] = useState<Error>();
  const handleEvent = useCallback((nextEvent: TEvent) => {
    setEvent(nextEvent);
    setError(undefined);
  }, []);
  const handleError = useCallback((nextError: unknown) => setError(toError(nextError)), []);
  useCallbackIdSubscription(start, removeSnapshotListener, handleEvent, handleError);
  return { event, error };
}

/**
 * Returns a copy of `options` whose identity only changes when its content
 * changes. The caller's object must never be used as a dependency itself:
 * object literals are recreated on every render and would resubscribe the
 * listener endlessly.
 */
function useStableOptions<TOptions>(options: TOptions): TOptions {
  const serializedOptions = JSON.stringify(options);
  return useMemo(() => JSON.parse(serializedOptions) as TOptions, [serializedOptions]);
}

function removeSnapshotListener(callbackId: CallbackId): Promise<void> {
  return FirebaseFirestore.removeSnapshotListener({ callbackId });
}
