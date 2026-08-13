import { PrivacyScreen } from '@capawesome/capacitor-privacy-screen';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Only available on Android and iOS.
 */
export const usePrivacyScreen = createMethodsHook('PrivacyScreen', PrivacyScreen, [
  'disable',
  'enable',
  'isEnabled',
]);

/**
 * Invokes `callback` after the user has taken a screenshot of the app. The
 * screenshot cannot be prevented because the event is only emitted afterwards.
 *
 * Only available on Android 14 (API level 34) and newer, and on iOS.
 */
export function useScreenshotTaken(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(PrivacyScreen, 'screenshotTaken', callback, options);
}
