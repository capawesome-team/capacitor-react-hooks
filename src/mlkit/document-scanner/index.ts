import type { GoogleDocumentScannerModuleInstallProgressEvent } from '@capacitor-mlkit/document-scanner';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android.
 *
 * `scanDocument` runs the whole capture flow in a native full-screen activity
 * and resolves once the user finishes or cancels it, so there is no session to
 * manage from React.
 */
export const useDocumentScanner = createMethodsHook('DocumentScanner', DocumentScanner, [
  'scanDocument',
  'isGoogleDocumentScannerModuleAvailable',
  'installGoogleDocumentScannerModule',
]);

/**
 * Invokes `callback` while the Google Document Scanner module is installing.
 * Only available on Android.
 */
export function useGoogleDocumentScannerModuleInstallProgress(
  callback: (event: GoogleDocumentScannerModuleInstallProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(
    DocumentScanner,
    'googleDocumentScannerModuleInstallProgress',
    callback,
    options,
  );
}
