import { AssetManager } from '@capawesome/capacitor-asset-manager';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useAssetManager = createMethodsHook('AssetManager', AssetManager, [
  'copy',
  'list',
  'read',
]);
