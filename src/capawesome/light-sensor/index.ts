import type { MeasurementEvent } from '@capawesome/capacitor-light-sensor';
import { LightSensor } from '@capawesome/capacitor-light-sensor';
import { useEffect } from 'react';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android. */
export const useLightSensor = createMethodsHook('LightSensor', LightSensor, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
]);

/**
 * Invokes `callback` on every ambient light measurement. Events are only
 * emitted while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `useLightSensorUpdates`, which does both.
 *
 * Only available on Android.
 */
export function useLightSensorMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(LightSensor, 'measurement', callback, options);
}

/**
 * Runs an ambient light measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * Measurement events are emitted at a high frequency. Keep `callback` cheap and
 * avoid storing every event in state.
 *
 * Only available on Android.
 */
export function useLightSensorUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useLightSensorMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void LightSensor.startMeasurementUpdates().catch(discardError);
    return () => {
      void LightSensor.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
