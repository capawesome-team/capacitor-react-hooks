import { SystemWebview } from '@capawesome/capacitor-system-webview';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useSystemWebview = createMethodsHook('SystemWebview', SystemWebview, [
  'getInfo',
  'isUpdateRequired',
  'openAppStore',
]);
