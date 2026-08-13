import type { MeasurementEvent } from '@capawesome/capacitor-proximity-sensor';
import { ProximitySensor } from '@capawesome/capacitor-proximity-sensor';
import { useEffect } from 'react';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useProximitySensor = createMethodsHook('ProximitySensor', ProximitySensor, [
  'getMeasurement',
  'isAvailable',
  'startMeasurementUpdates',
  'stopMeasurementUpdates',
]);

/**
 * Invokes `callback` on every proximity measurement. Events are only emitted
 * while measurement updates are running: start them with
 * `startMeasurementUpdates` or use `useProximitySensorUpdates`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useProximitySensorMeasurement(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ProximitySensor, 'measurement', callback, options);
}

/**
 * Runs a proximity measurement session for the lifetime of the component:
 * starts the measurement updates, invokes `callback` on every measurement and
 * stops the updates on unmount.
 *
 * On iOS, this enables proximity monitoring, which turns off the screen while
 * an object is close to the sensor.
 *
 * Only available on Android and iOS.
 */
export function useProximitySensorUpdates(
  callback: (event: MeasurementEvent) => void,
  options?: ListenerOptions,
): void {
  const enabled = options?.enabled ?? true;
  useProximitySensorMeasurement(callback, options);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    void ProximitySensor.startMeasurementUpdates().catch(discardError);
    return () => {
      void ProximitySensor.stopMeasurementUpdates().catch(discardError);
    };
  }, [enabled]);
}
