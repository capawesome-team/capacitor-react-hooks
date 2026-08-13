import { SplashScreen } from '@capacitor/splash-screen';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useSplashScreen = createMethodsHook('SplashScreen', SplashScreen, ['show', 'hide']);
