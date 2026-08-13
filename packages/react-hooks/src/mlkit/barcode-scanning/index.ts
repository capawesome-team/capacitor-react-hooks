import type {
  Barcode,
  BarcodesScannedEvent,
  GoogleBarcodeScannerModuleInstallProgressEvent,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardStopError = () => undefined;

/** Plugin methods plus `isAvailable`. */
export const useBarcodeScanning = createMethodsHook('BarcodeScanner', BarcodeScanner, [
  'startScan',
  'stopScan',
  'readBarcodesFromImage',
  'scan',
  'isSupported',
  'enableTorch',
  'disableTorch',
  'toggleTorch',
  'isTorchEnabled',
  'isTorchAvailable',
  'setZoomRatio',
  'getZoomRatio',
  'getMinZoomRatio',
  'getMaxZoomRatio',
  'openSettings',
  'isGoogleBarcodeScannerModuleAvailable',
  'installGoogleBarcodeScannerModule',
  'checkPermissions',
  'requestPermissions',
]);

/** The camera permission status, checked on mount. */
export const useBarcodeScanningPermissions = createPermissionsHook(BarcodeScanner);

export interface UseBarcodeScannerSessionResult {
  /** Starts a scan session. Rejects if the session cannot be started. */
  start: (options?: StartScanOptions) => Promise<void>;
  /** Stops the running scan session. */
  stop: () => Promise<void>;
  isScanning: boolean;
  /** The barcodes of the most recent scan event; empty until the first event. */
  barcodes: Barcode[];
}

/**
 * A scan session bound to the component lifecycle: `start` attaches the
 * `barcodesScanned` listener and starts scanning, `stop` reverses both.
 * Unmounting while scanning stops the session.
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
    async (options?: StartScanOptions) => {
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

/** Invokes `callback` while the Google Barcode Scanner module is installing. */
export function useGoogleBarcodeScannerModuleInstallProgress(
  callback: (event: GoogleBarcodeScannerModuleInstallProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BarcodeScanner, 'googleBarcodeScannerModuleInstallProgress', callback, options);
}
