import { GoogleMap } from '@capacitor/google-maps';
import type { RefObject } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { toError, useMountedRef } from '../../core';

const discardDestroyError = () => undefined;

/**
 * The map configuration accepted by `GoogleMap.create()`. Derived from the
 * plugin signature because the plugin does not export the type itself.
 */
export type GoogleMapConfig = Parameters<typeof GoogleMap.create>[0]['config'];

export interface UseGoogleMapOptions {
  /** Unique identifier of the map instance. */
  id: string;
  /** The Google Maps SDK API key. */
  apiKey: string;
  /**
   * The initial map configuration. Must be JSON-serializable. Only content
   * changes recreate the map, so passing a new object literal on every render
   * is safe.
   */
  config: GoogleMapConfig;
  /**
   * Reference to the element the map is bound to. The element must be rendered
   * when the hook runs; otherwise pass `enabled: false` until it is.
   */
  elementRef: RefObject<HTMLElement | null>;
  /** Set to `false` to skip creating the map. Default: `true`. */
  enabled?: boolean;
}

export interface UseGoogleMapResult {
  /** The map instance, or `undefined` until it has been created. */
  map: GoogleMap | undefined;
  /** The error of the last creation attempt, or `undefined` if it succeeded. */
  error: Error | undefined;
}

/**
 * Creates a Google Map bound to `elementRef` for the lifetime of the component
 * and destroys it on unmount. The map is recreated whenever `id`, `apiKey` or
 * the content of `config` changes.
 *
 * The map is rendered as a native view that the plugin positions and sizes to
 * match the bound element, so it lives beneath the webview instead of inside
 * the React tree. Event listeners are therefore attached directly on the
 * returned instance (`map.setOnMarkerClickListener(...)`), which also exposes
 * every other map method. A dedicated React component may follow later.
 *
 * Errors raised while creating the map are exposed as `error` instead of being
 * thrown.
 */
export function useGoogleMap(options: UseGoogleMapOptions): UseGoogleMapResult {
  const { id, apiKey, config, elementRef, enabled = true } = options;
  const stableConfig = useStableConfig(config);
  const [map, setMap] = useState<GoogleMap>();
  const [error, setError] = useState<Error>();
  const mountedRef = useMountedRef();

  useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element) {
      return;
    }
    let destroyed = false;
    let createdMap: GoogleMap | undefined;
    GoogleMap.create({ id, apiKey, config: stableConfig, element })
      .then(resolvedMap => {
        if (destroyed) {
          void resolvedMap.destroy().catch(discardDestroyError);
          return;
        }
        createdMap = resolvedMap;
        if (mountedRef.current) {
          setMap(resolvedMap);
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
      setMap(undefined);
      if (createdMap) {
        void createdMap.destroy().catch(discardDestroyError);
      }
    };
  }, [id, apiKey, stableConfig, elementRef, enabled, mountedRef]);

  return useMemo(() => ({ map, error }), [map, error]);
}

/**
 * Returns a copy of `config` whose identity only changes when its content
 * changes. The caller's object must never be used as a dependency itself:
 * object literals are recreated on every render and would recreate the map
 * endlessly.
 */
function useStableConfig(config: GoogleMapConfig): GoogleMapConfig {
  const serializedConfig = JSON.stringify(config);
  return useMemo(() => JSON.parse(serializedConfig) as GoogleMapConfig, [serializedConfig]);
}
