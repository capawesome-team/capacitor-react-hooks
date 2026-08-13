import type {
  CodeRecognizeEvent,
  EnterContextEvent,
  EventFromContentEvent,
  ExitContextEvent,
  RequireSyncEvent,
  SyncProgressEvent,
} from '@capawesome/capacitor-pixlive';
import { Pixlive } from '@capawesome/capacitor-pixlive';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called before any other method. All methods are only
 * available on Android and iOS, except `checkPermissions`,
 * `requestPermissions` and `getVersion`.
 */
export const usePixlive = createMethodsHook('Pixlive', Pixlive, [
  'activateContext',
  'checkPermissions',
  'createARView',
  'destroyARView',
  'enableContextsWithTags',
  'getContext',
  'getContexts',
  'getGPSPointsInBoundingBox',
  'getNearbyBeacons',
  'getNearbyGPSPoints',
  'getVersion',
  'initialize',
  'requestPermissions',
  'resizeARView',
  'setARViewTouchEnabled',
  'setARViewTouchHole',
  'setInterfaceLanguage',
  'setNotificationsSupport',
  'startGPSNotifications',
  'startNearbyGPSDetection',
  'stopContext',
  'stopGPSNotifications',
  'stopNearbyGPSDetection',
  'synchronize',
  'synchronizeWithToursAndContexts',
  'updateTagMapping',
]);

/**
 * Camera, location, Bluetooth and notification permission status with
 * imperative `check` and `request`. Pass the permissions to request to
 * `request`; all permissions are requested when omitted.
 */
export const usePixlivePermissions = createPermissionsHook(Pixlive);

/** Invokes `callback` when a QR code or barcode is scanned by the AR camera. */
export function usePixliveCodeRecognize(
  callback: (event: CodeRecognizeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'codeRecognize', callback, options);
}

/** Invokes `callback` when an AR context is detected. */
export function usePixliveEnterContext(
  callback: (event: EnterContextEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'enterContext', callback, options);
}

/** Invokes `callback` when an AR context is lost. */
export function usePixliveExitContext(
  callback: (event: ExitContextEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'exitContext', callback, options);
}

/** Invokes `callback` when AR annotations become visible on screen. */
export function usePixlivePresentAnnotations(
  callback: () => void,
  options?: ListenerOptions,
): void {
  usePluginListener<void>(Pixlive, 'presentAnnotations', callback, options);
}

/** Invokes `callback` when AR annotations are hidden. */
export function usePixliveHideAnnotations(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Pixlive, 'hideAnnotations', callback, options);
}

/** Invokes `callback` when AR content dispatches a custom event. */
export function usePixliveEventFromContent(
  callback: (event: EventFromContentEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'eventFromContent', callback, options);
}

/** Invokes `callback` with progress updates during synchronization. */
export function usePixliveSyncProgress(
  callback: (event: SyncProgressEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'syncProgress', callback, options);
}

/** Invokes `callback` when the SDK requires synchronization with specific tags. */
export function usePixliveRequireSync(
  callback: (event: RequireSyncEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pixlive, 'requireSync', callback, options);
}
