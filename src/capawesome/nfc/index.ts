import type {
  CommandReceivedEvent,
  NfcLinkDeactivatedEvent,
  NfcTag,
  NfcTagScannedEvent,
  ScanSessionErrorEvent,
  StartScanSessionOptions,
  StopScanSessionOptions,
} from '@capawesome-team/capacitor-nfc';
import { Nfc } from '@capawesome-team/capacitor-nfc';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardStopError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. */
export const useNfc = createMethodsHook('Nfc', Nfc, [
  'startScanSession',
  'stopScanSession',
  'write',
  'respond',
  'makeReadOnly',
  'erase',
  'format',
  'transceive',
  'connect',
  'close',
  'isAvailable',
  'isEnabled',
  'openSettings',
  'getAntennaInfo',
  'setAlertMessage',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * The NFC permission status, checked on mount.
 *
 * On Android and iOS, the permission is always granted.
 */
export const useNfcPermissions = createPermissionsHook(Nfc);

/** The state and controls of a scan session. */
export interface UseNfcScanSessionResult {
  /** Starts a scan session. Rejects if the session cannot be started. */
  start: (options?: StartScanSessionOptions) => Promise<void>;
  /** Stops the running scan session. */
  stop: (options?: StopScanSessionOptions) => Promise<void>;
  isScanning: boolean;
  /** The most recently scanned tag; `undefined` until the first tag is scanned. */
  nfcTag: NfcTag | undefined;
}

/**
 * A scan session bound to the component lifecycle: `start` attaches the
 * `nfcTagScanned` listener and starts the session, `stop` reverses both.
 * Unmounting while scanning stops the session. On iOS, the session also ends
 * when the user cancels it.
 *
 * Session errors are not exposed here. Observe them with
 * `useNfcScanSessionError`.
 */
export function useNfcScanSession(): UseNfcScanSessionResult {
  const [isScanning, setIsScanning] = useState(false);
  const [nfcTag, setNfcTag] = useState<NfcTag>();
  const isScanningRef = useRef(false);
  const mountedRef = useMountedRef();

  const setScanning = useCallback(
    (next: boolean) => {
      isScanningRef.current = next;
      if (mountedRef.current) {
        setIsScanning(next);
      }
    },
    [mountedRef],
  );

  usePluginListener<NfcTagScannedEvent>(Nfc, 'nfcTagScanned', event => setNfcTag(event.nfcTag), {
    enabled: isScanning,
  });
  usePluginListener<void>(Nfc, 'scanSessionCanceled', () => setScanning(false), {
    enabled: isScanning,
  });

  const start = useCallback(
    async (options?: StartScanSessionOptions) => {
      setNfcTag(undefined);
      setScanning(true);
      try {
        await Nfc.startScanSession(options);
      } catch (error) {
        setScanning(false);
        throw error;
      }
    },
    [setScanning],
  );

  const stop = useCallback(
    async (options?: StopScanSessionOptions) => {
      setScanning(false);
      await Nfc.stopScanSession(options);
    },
    [setScanning],
  );

  useEffect(
    () => () => {
      if (!isScanningRef.current) {
        return;
      }
      isScanningRef.current = false;
      void Nfc.stopScanSession().catch(discardStopError);
    },
    [],
  );

  return useMemo(() => ({ start, stop, isScanning, nfcTag }), [start, stop, isScanning, nfcTag]);
}

/**
 * Invokes `callback` whenever a NFC reader sends an Application Protocol Data
 * Unit (APDU).
 *
 * Only available on Android.
 */
export function useNfcCommandReceived(
  callback: (event: CommandReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Nfc, 'commandReceived', callback, options);
}

/**
 * Invokes `callback` whenever the NFC link to the remote device is deactivated.
 *
 * Only available on Android.
 */
export function useNfcLinkDeactivated(
  callback: (event: NfcLinkDeactivatedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Nfc, 'nfcLinkDeactivated', callback, options);
}

/**
 * Invokes `callback` whenever the scan session is canceled by the user.
 *
 * Only available on iOS.
 */
export function useNfcScanSessionCanceled(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Nfc, 'scanSessionCanceled', callback, options);
}

/** Invokes `callback` whenever an error occurs during the scan session. */
export function useNfcScanSessionError(
  callback: (event: ScanSessionErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Nfc, 'scanSessionError', callback, options);
}

/**
 * Invokes `callback` whenever a NFC tag is scanned. Tags are only scanned while
 * a scan session is running: start one with `startScanSession` or use
 * `useNfcScanSession`, which does both.
 */
export function useNfcTagScanned(
  callback: (event: NfcTagScannedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Nfc, 'nfcTagScanned', callback, options);
}
