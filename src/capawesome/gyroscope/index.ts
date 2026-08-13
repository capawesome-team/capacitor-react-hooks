import type { MeasurementEvent } from '@capawesome/capacitor-gyroscope';
import { Gyroscope } from '@capawesome/capacitor-gyroscope';
import { useEffect } from 'react';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. */
export const useGyroscope = createMethodsHook('Gyroscope', Gyroscope, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
  'checkPermissions',
  'requestPermissions',
]);

/** Gyroscope permission status with imperative `check` and `request`. */
export const useGyroscopePermissions = createPermissionsHook(Gyroscope);

/**
 * Invokes `callback` on every gyroscope measurement. Events are only emitted
 * while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `useGyroscopeUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useGyroscopeMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Gyroscope, 'measurement', callback, options);
}

/**
 * Runs a gyroscope measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * Measurement events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android and iOS.
 */
export function useGyroscopeUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useGyroscopeMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Gyroscope.startMeasurementUpdates().catch(discardError);
    return () => {
      void Gyroscope.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
