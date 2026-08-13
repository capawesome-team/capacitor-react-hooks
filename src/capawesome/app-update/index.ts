import type { FlexibleUpdateState } from '@capawesome/capacitor-app-update';
import { AppUpdate } from '@capawesome/capacitor-app-update';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * The in-app update methods `performImmediateUpdate`, `startFlexibleUpdate`
 * and `completeFlexibleUpdate` are only available on Android.
 */
export const useAppUpdate = createMethodsHook('AppUpdate', AppUpdate, [
  'getAppUpdateInfo',
  'openAppStore',
  'performImmediateUpdate',
  'startFlexibleUpdate',
  'completeFlexibleUpdate',
]);

/**
 * Invokes `callback` whenever the state of a flexible in-app update changes.
 * Only available on Android.
 */
export function useFlexibleUpdateStateChange(
  callback: (state: FlexibleUpdateState) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AppUpdate, 'onFlexibleUpdateStateChange', callback, options);
}
