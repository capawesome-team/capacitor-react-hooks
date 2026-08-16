import { FirebaseFunctions } from '@capacitor-firebase/functions';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `callByName` and `callByUrl` keep their `RequestData` and `ResponseData` type
 * parameters, so calls can be typed as `callByName<Request, Response>(options)`.
 */
export const useFirebaseFunctions = createMethodsHook('FirebaseFunctions', FirebaseFunctions, [
  'callByName',
  'callByUrl',
  'useEmulator',
]);
