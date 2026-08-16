import { Zip } from '@capawesome-team/capacitor-zip';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useZip = createMethodsHook('Zip', Zip, ['unzip', 'zip']);
