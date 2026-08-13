import { TextZoom } from '@capacitor/text-zoom';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The plugin emits no event when the user changes the text size in the
 * operating system settings: call `get()` again whenever the zoom level may
 * have changed, for example when the app resumes.
 */
export const useTextZoom = createMethodsHook('TextZoom', TextZoom, ['get', 'getPreferred', 'set']);
