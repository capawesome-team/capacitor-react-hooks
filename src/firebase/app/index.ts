import { FirebaseApp } from '@capacitor-firebase/app';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFirebaseApp = createMethodsHook('FirebaseApp', FirebaseApp, [
  'getName',
  'getOptions',
]);
