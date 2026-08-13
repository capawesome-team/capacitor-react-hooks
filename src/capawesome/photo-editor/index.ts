import { PhotoEditor } from '@capawesome/capacitor-photo-editor';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android.
 *
 * `editPhoto` delegates to an installed photo editing app (e.g. Google Photos)
 * and resolves as soon as that app is launched, not when editing finishes.
 */
export const usePhotoEditor = createMethodsHook('PhotoEditor', PhotoEditor, ['editPhoto']);
