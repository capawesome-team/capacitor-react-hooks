import type {
  CameraIdleEvent,
  CameraMoveStartedEvent,
  CreateMapOptions,
  MapClickEvent,
  MarkerClickEvent,
  MarkerDragEndEvent,
  MarkerDragEvent,
  MarkerDragStartEvent,
  UserLocationChangeEvent,
} from '@capawesome/capacitor-maplibre';
import { MapLibre } from '@capawesome/capacitor-maplibre';
import { useEffect, useMemo, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  toError,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`. `elementFromPointResult` is
 * omitted because the plugin calls it itself and it must not be called
 * manually.
 */
export const useMapLibre = createMethodsHook('MapLibre', MapLibre, [
  'addGeoJsonSource',
  'addLayer',
  'addMarker',
  'addMarkers',
  'addPolyline',
  'addPolylines',
  'checkPermissions',
  'createMap',
  'destroyMap',
  'disableUserLocation',
  'enableUserLocation',
  'fitBounds',
  'getCamera',
  'removeAllMarkers',
  'removeAllPolylines',
  'removeGeoJsonSourceById',
  'removeLayerById',
  'removeMarkerById',
  'removeMarkersByIds',
  'removePolylineById',
  'removePolylinesByIds',
  'requestPermissions',
  'setCamera',
  'setFrame',
  'setGesturesEnabled',
  'setStyle',
  'updateGeoJsonSourceById',
  'updateMarkerById',
  'updatePolylineById',
]);

/**
 * Status of the location permission with imperative `check` and `request`.
 * The permission is required to display the location of the user on the map.
 */
export const useMapLibrePermissions = createPermissionsHook(MapLibre);

export interface UseMapLibreMapOptions {
  /**
   * The map configuration passed to `MapLibre.createMap()`. Must be
   * JSON-serializable. Only content changes recreate the map, so passing a new
   * object literal on every render is safe.
   */
  config: CreateMapOptions;
  /** Set to `false` to skip creating the map. Default: `true`. */
  enabled?: boolean;
}

export interface UseMapLibreMapResult {
  /** The identifier of the map, or `undefined` until it has been created. */
  mapId: string | undefined;
  /** The error of the last creation attempt, or `undefined` if it succeeded. */
  error: Error | undefined;
}

/**
 * Creates a map for the lifetime of the component and destroys it on unmount.
 * The map is recreated whenever the content of `config` changes.
 *
 * The element with the `elementId` of the configuration must be rendered and
 * empty when the hook runs; otherwise pass `enabled: false` until it is. On
 * Android and iOS, the map is rendered as a native view behind the web view,
 * so the element and everything above the map must be transparent. Event
 * listeners are therefore not attached to the element but with the listener
 * hooks of this module, which report the affected map as `event.mapId`.
 *
 * Errors raised while creating the map are exposed as `error` instead of being
 * thrown.
 */
export function useMapLibreMap(options: UseMapLibreMapOptions): UseMapLibreMapResult {
  const { config, enabled = true } = options;
  const stableConfig = useStableConfig(config);
  const [mapId, setMapId] = useState<string>();
  const [error, setError] = useState<Error>();
  const mountedRef = useMountedRef();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const { mapId: currentMapId } = stableConfig;
    let destroyed = false;
    let created = false;
    runMapOperation(currentMapId, async () => {
      await MapLibre.createMap(stableConfig);
      created = true;
    })
      .then(() => {
        if (!destroyed && mountedRef.current) {
          setMapId(currentMapId);
          setError(undefined);
        }
      })
      .catch(caught => {
        if (mountedRef.current) {
          setError(toError(caught));
        }
      });
    return () => {
      destroyed = true;
      setMapId(undefined);
      void runMapOperation(currentMapId, async () => {
        if (created) {
          await MapLibre.destroyMap({ mapId: currentMapId });
        }
      }).catch(discardError);
    };
  }, [stableConfig, enabled, mountedRef]);

  return useMemo(() => ({ mapId, error }), [mapId, error]);
}

/** Invokes `callback` whenever the camera of a map has stopped moving. */
export function useCameraIdle(
  callback: (event: CameraIdleEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'cameraIdle', callback, options);
}

/** Invokes `callback` whenever the camera of a map has started moving. */
export function useCameraMoveStarted(
  callback: (event: CameraMoveStartedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'cameraMoveStarted', callback, options);
}

/** Invokes `callback` whenever the user taps on a map. */
export function useMapClick(
  callback: (event: MapClickEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'mapClick', callback, options);
}

/** Invokes `callback` whenever the user taps on a marker. */
export function useMarkerClick(
  callback: (event: MarkerClickEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'markerClick', callback, options);
}

/**
 * Invokes `callback` while the user drags a marker.
 *
 * Only available on Android and Web.
 */
export function useMarkerDrag(
  callback: (event: MarkerDragEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'markerDrag', callback, options);
}

/**
 * Invokes `callback` whenever the user has stopped dragging a marker.
 *
 * Only available on Android and Web.
 */
export function useMarkerDragEnd(
  callback: (event: MarkerDragEndEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'markerDragEnd', callback, options);
}

/**
 * Invokes `callback` whenever the user has started dragging a marker.
 *
 * Only available on Android and Web.
 */
export function useMarkerDragStart(
  callback: (event: MarkerDragStartEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'markerDragStart', callback, options);
}

/**
 * Invokes `callback` whenever the location of the user changes. Only emitted
 * while the location of the user is displayed on the map.
 */
export function useUserLocationChange(
  callback: (event: UserLocationChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MapLibre, 'userLocationChange', callback, options);
}

const pendingMapOperations = new Map<string, Promise<void>>();

/**
 * Runs `operation` after every operation queued for the same map has settled.
 * Maps are identified by their `mapId` instead of an instance, so creating a
 * map must never overlap the destruction of the previous map with the same
 * identifier — which is exactly what a remount, for example under StrictMode,
 * would otherwise cause.
 */
function runMapOperation(mapId: string, operation: () => Promise<void>): Promise<void> {
  const previous = pendingMapOperations.get(mapId) ?? Promise.resolve();
  const current = previous.then(operation);
  const settled: Promise<void> = current.catch(discardError).then(() => {
    if (pendingMapOperations.get(mapId) === settled) {
      pendingMapOperations.delete(mapId);
    }
  });
  pendingMapOperations.set(mapId, settled);
  return current;
}

/**
 * Returns a copy of `config` whose identity only changes when its content
 * changes. The caller's object must never be used as a dependency itself:
 * object literals are recreated on every render and would recreate the map
 * endlessly.
 */
function useStableConfig(config: CreateMapOptions): CreateMapOptions {
  const serializedConfig = JSON.stringify(config);
  return useMemo(() => JSON.parse(serializedConfig) as CreateMapOptions, [serializedConfig]);
}
