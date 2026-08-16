import type {
  Barcode,
  BarcodesScannedEvent,
  ScanErrorEvent,
  StartScanOptions,
} from '@capawesome-team/capacitor-barcode-scanner';
import { BarcodeScanner } from '@capawesome-team/capacitor-barcode-scanner';
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
export const useBarcodeScanner = createMethodsHook('BarcodeScanner', BarcodeScanner, [
  'checkPermissions',
  'getZoomRatioRange',
  'isAvailable',
  'openSettings',
  'pauseScan',
  'readBarcodesFromImage',
  'requestPermissions',
  'resumeScan',
  'scan',
  'setScanFrame',
  'setTorchEnabled',
  'setZoomRatio',
  'startScan',
  'stopScan',
]);

/** The camera permission status, checked on mount. */
export const useBarcodeScannerPermissions = createPermissionsHook(BarcodeScanner);

export interface UseBarcodeScannerSessionResult {
  /** Starts an embedded scan session. Rejects if the session cannot be started. */
  start: (options: StartScanOptions) => Promise<void>;
  /** Stops the running scan session and removes the camera preview. */
  stop: () => Promise<void>;
  isScanning: boolean;
  /** The barcodes of the most recent scan event; empty until the first event. */
  barcodes: Barcode[];
}

/**
 * An embedded scan session bound to the component lifecycle: `start` attaches
 * the `barcodesScanned` listener and starts scanning, `stop` reverses both.
 * Unmounting while scanning stops the session.
 *
 * The camera preview is rendered as a native view in the frame passed to
 * `start`, so measure a placeholder element to reserve the space in your
 * layout and call `setScanFrame(...)` whenever the layout changes.
 */
export function useBarcodeScannerSession(): UseBarcodeScannerSessionResult {
  const [isScanning, setIsScanning] = useState(false);
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const isScanningRef = useRef(false);
  const mountedRef = useMountedRef();

  usePluginListener<BarcodesScannedEvent>(
    BarcodeScanner,
    'barcodesScanned',
    event => setBarcodes(event.barcodes),
    { enabled: isScanning },
  );

  const setScanning = useCallback(
    (next: boolean) => {
      isScanningRef.current = next;
      if (mountedRef.current) {
        setIsScanning(next);
      }
    },
    [mountedRef],
  );

  const start = useCallback(
    async (options: StartScanOptions) => {
      setBarcodes([]);
      setScanning(true);
      try {
        await BarcodeScanner.startScan(options);
      } catch (error) {
        setScanning(false);
        throw error;
      }
    },
    [setScanning],
  );

  const stop = useCallback(async () => {
    setScanning(false);
    await BarcodeScanner.stopScan();
  }, [setScanning]);

  useEffect(
    () => () => {
      if (!isScanningRef.current) {
        return;
      }
      isScanningRef.current = false;
      void BarcodeScanner.stopScan().catch(discardStopError);
    },
    [],
  );

  return useMemo(
    () => ({ start, stop, isScanning, barcodes }),
    [start, stop, isScanning, barcodes],
  );
}

/** Invokes `callback` whenever barcodes are detected during an active scan session. */
export function useBarcodesScanned(
  callback: (event: BarcodesScannedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BarcodeScanner, 'barcodesScanned', callback, options);
}

/** Invokes `callback` whenever an error occurs during an active scan session. */
export function useScanError(
  callback: (event: ScanErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BarcodeScanner, 'scanError', callback, options);
}
