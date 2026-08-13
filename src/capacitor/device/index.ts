import type { BatteryInfo } from '@capacitor/device';
import { Device } from '@capacitor/device';
import { useEffect, useState } from 'react';

import { createMethodsHook, useMountedRef } from '../../core';

const discardError = () => undefined;

/** Plugin methods plus `isAvailable`. */
export const useDevice = createMethodsHook('Device', Device, [
  'getId',
  'getInfo',
  'getBatteryInfo',
  'getLanguageCode',
  'getLanguageTag',
]);

export interface UseBatteryInfoOptions {
  /** Milliseconds between refetches. Omit to fetch only once on mount. */
  pollInterval?: number;
}

/**
 * The battery level and charging state, fetched once on mount. `undefined`
 * until the first result resolves and whenever a fetch fails.
 *
 * The plugin emits no battery change event, so keeping the value fresh
 * requires polling: set `pollInterval` to refetch on that interval. Poll as
 * rarely as the screen allows, every fetch crosses the native bridge.
 */
export function useBatteryInfo(options?: UseBatteryInfoOptions): BatteryInfo | undefined {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>();
  const mountedRef = useMountedRef();
  const pollInterval = options?.pollInterval;

  useEffect(() => {
    const fetchBatteryInfo = () => {
      void Device.getBatteryInfo().then(info => {
        if (mountedRef.current) {
          setBatteryInfo(info);
        }
      }, discardError);
    };
    fetchBatteryInfo();
    if (pollInterval === undefined) {
      return;
    }
    const intervalId = setInterval(fetchBatteryInfo, pollInterval);
    return () => clearInterval(intervalId);
  }, [pollInterval, mountedRef]);

  return batteryInfo;
}
