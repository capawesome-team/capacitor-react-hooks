import type { MeasurementEvent } from '@capawesome-team/capacitor-pedometer';
import { Pedometer } from '@capawesome-team/capacitor-pedometer';
import { useEffect } from 'react';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const usePedometer = createMethodsHook('Pedometer', Pedometer, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
  'checkPermissions',
  'requestPermissions',
]);

/** Activity recognition permission status with imperative `check` and `request`. */
export const usePedometerPermissions = createPermissionsHook(Pedometer);

/**
 * Invokes `callback` on every pedometer measurement. Events are only emitted
 * while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `usePedometerUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function usePedometerMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Pedometer, 'measurement', callback, options);
}

/**
 * Runs a pedometer measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * Only available on Android and iOS.
 */
export function usePedometerUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  usePedometerMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Pedometer.startMeasurementUpdates().catch(discardError);
    return () => {
      void Pedometer.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
