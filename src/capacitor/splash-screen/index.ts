import { SplashScreen } from '@capacitor/splash-screen';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isAvailable`. */
export const useSplashScreen = createMethodsHook('SplashScreen', SplashScreen, ['show', 'hide']);
