import type { PageChangeEvent } from '@capawesome/capacitor-pdf-viewer';
import { PdfViewer } from '@capawesome/capacitor-pdf-viewer';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const usePdfViewer = createMethodsHook('PdfViewer', PdfViewer, ['open', 'close']);

/** Invokes `callback` when the viewer is closed. Only available on Android and iOS. */
export function usePdfViewerClosed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(PdfViewer, 'closed', callback, options);
}

/**
 * Invokes `callback` when the currently displayed page changes.
 * Only available on Android and iOS.
 */
export function usePdfViewerPageChange(
  callback: (event: PageChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(PdfViewer, 'pageChange', callback, options);
}
