import type { MeasurementEvent } from '@capawesome-team/capacitor-accelerometer';
import { Accelerometer } from '@capawesome-team/capacitor-accelerometer';
import { useEffect } from 'react';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useAccelerometer = createMethodsHook('Accelerometer', Accelerometer, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
  'checkPermissions',
  'requestPermissions',
]);

/** Accelerometer permission status with imperative `check` and `request`. */
export const useAccelerometerPermissions = createPermissionsHook(Accelerometer);

/**
 * Invokes `callback` on every accelerometer measurement. Events are only
 * emitted while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `useAccelerometerUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useAccelerometerMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Accelerometer, 'measurement', callback, options);
}

/**
 * Runs an accelerometer measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * Measurement events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android and iOS.
 */
export function useAccelerometerUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useAccelerometerMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void Accelerometer.startMeasurementUpdates().catch(discardError);
    return () => {
      void Accelerometer.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
