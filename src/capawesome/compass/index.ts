import type { HeadingChangeEvent } from '@capawesome/capacitor-compass';
import { Compass } from '@capawesome/capacitor-compass';
import { useEffect } from 'react';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useCompass = createMethodsHook('Compass', Compass, [
  'getHeading',
  'isAvailable',
  'startHeadingUpdates',
  'stopHeadingUpdates',
]);

/**
 * Invokes `callback` on every heading change. Events are only emitted while
 * heading updates are running: start them with `startHeadingUpdates` or use
 * `useCompassUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useHeadingChange(
  callback: (event: HeadingChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Compass, 'headingChange', callback, options);
}

/**
 * Runs a heading update session for the lifetime of the component: starts the
 * heading updates, invokes `callback` on every heading change and stops the
 * updates on unmount.
 *
 * Heading events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android and iOS.
 */
export function useCompassUpdates(
  callback: (event: HeadingChangeEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useHeadingChange(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Compass.startHeadingUpdates().catch(discardError);
    return () => {
      void Compass.stopHeadingUpdates().catch(discardError);
    };
  }, [enabled]);
}
