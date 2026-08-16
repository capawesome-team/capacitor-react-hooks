import { Printer } from '@capawesome-team/capacitor-printer';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * All methods except `printWebView` are only available on Android and iOS.
 * Prefer `printFile` over `printBase64`, because large base64 payloads can
 * crash the app.
 */
export const usePrinter = createMethodsHook('Printer', Printer, [
  'printBase64',
  'printFile',
  'printHtml',
  'printPdf',
  'printWebView',
]);
