import type {
  GeofenceTransitionEvent,
  SyncFailedEvent,
} from '@capawesome-team/capacitor-geofences';
import { Geofences } from '@capawesome-team/capacitor-geofences';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Monitored geofences are persisted natively and outlive the component that
 * added them, so there is no lifecycle-bound session hook.
 *
 * Only available on Android and iOS.
 */
export const useGeofences = createMethodsHook('Geofences', Geofences, [
  'addGeofences',
  'clearSyncQueue',
  'configureSync',
  'disableSync',
  'getGeofences',
  'getSyncStatus',
  'openSettings',
  'removeAllGeofences',
  'removeGeofences',
  'triggerSync',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * The location and notification permission status, checked on mount.
 *
 * The `backgroundLocation` permission must be requested in a second, separate
 * call after the `location` permission has been granted.
 */
export const useGeofencesPermissions = createPermissionsHook(Geofences);

/**
 * Invokes `callback` whenever a geofence transition is detected.
 *
 * Transitions that occurred while the app was terminated are replayed once the
 * first listener is registered, so attach this hook as early as possible.
 *
 * Only available on Android and iOS.
 */
export function useGeofenceTransition(
  callback: (event: GeofenceTransitionEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Geofences, 'geofenceTransition', callback, options);
}

/**
 * Invokes `callback` whenever an upload attempt of buffered transitions fails.
 *
 * Only available on Android and iOS.
 */
export function useGeofencesSyncFailed(
  callback: (event: SyncFailedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Geofences, 'syncFailed', callback, options);
}
