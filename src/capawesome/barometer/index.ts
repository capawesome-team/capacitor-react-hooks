import type { MeasurementEvent } from '@capawesome-team/capacitor-barometer';
import { Barometer } from '@capawesome-team/capacitor-barometer';
import { useEffect } from 'react';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useBarometer = createMethodsHook('Barometer', Barometer, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Barometer permission status with imperative `check` and `request`.
 *
 * Only available on Android and iOS.
 */
export const useBarometerPermissions = createPermissionsHook(Barometer);

/**
 * Invokes `callback` on every barometer measurement. Events are only emitted
 * while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `useBarometerUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useBarometerMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Barometer, 'measurement', callback, options);
}

/**
 * Runs a barometer measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * Measurement events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android and iOS.
 */
export function useBarometerUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useBarometerMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Barometer.startMeasurementUpdates().catch(discardError);
    return () => {
      void Barometer.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
