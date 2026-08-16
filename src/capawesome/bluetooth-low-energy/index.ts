import type {
  CharacteristicChangedEvent,
  CharacteristicWriteRequestEvent,
  Device,
  DeviceConnectedEvent,
  DeviceDisconnectedEvent,
  DeviceScannedEvent,
  StartScanOptions,
} from '@capawesome-team/capacitor-bluetooth-low-energy';
import { BluetoothLowEnergy } from '@capawesome-team/capacitor-bluetooth-low-energy';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createMethodsHook,
  createPermissionsHook,
  createPluginStateHook,
  pluginEventSubscription,
  useMountedRef,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

const discardError = () => undefined;

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Call `initialize` before using any other method.
 */
export const useBluetoothLowEnergy = createMethodsHook('BluetoothLowEnergy', BluetoothLowEnergy, [
  'connect',
  'createBond',
  'disconnect',
  'discoverServices',
  'getConnectedDevices',
  'getServices',
  'initialize',
  'isAvailable',
  'isBonded',
  'isEnabled',
  'isExtendedAdvertisingAvailable',
  'isLocationEnabled',
  'openAppSettings',
  'openBluetoothSettings',
  'openLocationSettings',
  'readCharacteristic',
  'readDescriptor',
  'readRssi',
  'requestConnectionPriority',
  'requestMtu',
  'setCharacteristicValue',
  'startAdvertising',
  'startCharacteristicNotifications',
  'startForegroundService',
  'startScan',
  'stopAdvertising',
  'stopCharacteristicNotifications',
  'stopForegroundService',
  'stopScan',
  'writeCharacteristic',
  'writeDescriptor',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * The Bluetooth permission status, checked on mount.
 *
 * Only available on Android.
 */
export const useBluetoothLowEnergyPermissions = createPermissionsHook(BluetoothLowEnergy);

const subscribeToDeviceConnected = pluginEventSubscription<DeviceConnectedEvent>(
  BluetoothLowEnergy,
  'deviceConnected',
);
const subscribeToDeviceDisconnected = pluginEventSubscription<DeviceDisconnectedEvent>(
  BluetoothLowEnergy,
  'deviceDisconnected',
);

/**
 * The currently connected devices, kept in sync via a single shared listener
 * for connects and disconnects. `undefined` until the initial devices resolve.
 *
 * Only available on Android and iOS.
 */
export const useBluetoothLowEnergyConnectedDevices = createPluginStateHook<Device[]>({
  load: async () => (await BluetoothLowEnergy.getConnectedDevices()).devices,
  subscribe: emit => {
    const reload = () => {
      BluetoothLowEnergy.getConnectedDevices().then(result => emit(result.devices), discardError);
    };
    const unsubscribeFromConnected = subscribeToDeviceConnected(reload);
    const unsubscribeFromDisconnected = subscribeToDeviceDisconnected(reload);
    return () => {
      unsubscribeFromConnected();
      unsubscribeFromDisconnected();
    };
  },
});

/** The state and controls of a scan session. */
export interface UseBluetoothLowEnergyScanSessionResult {
  /** Starts a scan session. Rejects if the scan cannot be started. */
  start: (options?: StartScanOptions) => Promise<void>;
  /** Stops the running scan session. */
  stop: () => Promise<void>;
  isScanning: boolean;
  /** The devices scanned during the running session; empty until the first device is scanned. */
  devices: DeviceScannedEvent[];
}

/**
 * A scan session bound to the component lifecycle: `start` attaches the
 * `deviceScanned` listener and starts scanning, `stop` reverses both.
 * Unmounting while scanning stops the session.
 *
 * Each device is listed once with its most recent advertisement data.
 *
 * Only available on Android and iOS.
 */
export function useBluetoothLowEnergyScanSession(): UseBluetoothLowEnergyScanSessionResult {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceScannedEvent[]>([]);
  const isScanningRef = useRef(false);
  const mountedRef = useMountedRef();

  usePluginListener<DeviceScannedEvent>(
    BluetoothLowEnergy,
    'deviceScanned',
    event => setDevices(current => upsertDevice(current, event)),
    { enabled: isScanning },
  );

  const setScanning = useCallback(
    (next: boolean) => {
      isScanningRef.current = next;
      if (mountedRef.current) {
        setIsScanning(next);
      }
    },
    [mountedRef],
  );

  const start = useCallback(
    async (options?: StartScanOptions) => {
      setDevices([]);
      setScanning(true);
      try {
        await BluetoothLowEnergy.startScan(options);
      } catch (error) {
        setScanning(false);
        throw error;
      }
    },
    [setScanning],
  );

  const stop = useCallback(async () => {
    setScanning(false);
    await BluetoothLowEnergy.stopScan();
  }, [setScanning]);

  useEffect(
    () => () => {
      if (!isScanningRef.current) {
        return;
      }
      isScanningRef.current = false;
      void BluetoothLowEnergy.stopScan().catch(discardError);
    },
    [],
  );

  return useMemo(() => ({ start, stop, isScanning, devices }), [start, stop, isScanning, devices]);
}

function upsertDevice(
  devices: DeviceScannedEvent[],
  device: DeviceScannedEvent,
): DeviceScannedEvent[] {
  const index = devices.findIndex(candidate => candidate.id === device.id);
  if (index === -1) {
    return [...devices, device];
  }
  const next = [...devices];
  next[index] = device;
  return next;
}

/**
 * Invokes `callback` whenever the value of a characteristic changes. Changes
 * are only emitted for characteristics registered with
 * `startCharacteristicNotifications`.
 *
 * Only available on Android and iOS.
 */
export function useBluetoothLowEnergyCharacteristicChanged(
  callback: (event: CharacteristicChangedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BluetoothLowEnergy, 'characteristicChanged', callback, options);
}

/**
 * Invokes `callback` whenever a remote device requests to write a
 * characteristic.
 *
 * Only available on Android.
 */
export function useBluetoothLowEnergyCharacteristicWriteRequest(
  callback: (event: CharacteristicWriteRequestEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BluetoothLowEnergy, 'characteristicWriteRequest', callback, options);
}

/**
 * Invokes `callback` whenever a device is connected.
 *
 * Only available on Android and iOS.
 */
export function useBluetoothLowEnergyDeviceConnected(
  callback: (event: DeviceConnectedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BluetoothLowEnergy, 'deviceConnected', callback, options);
}

/**
 * Invokes `callback` whenever a device is disconnected.
 *
 * Only available on Android and iOS.
 */
export function useBluetoothLowEnergyDeviceDisconnected(
  callback: (event: DeviceDisconnectedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BluetoothLowEnergy, 'deviceDisconnected', callback, options);
}

/**
 * Invokes `callback` whenever a device is scanned. Devices are only scanned
 * while a scan is running: start one with `startScan` or use
 * `useBluetoothLowEnergyScanSession`, which does both.
 *
 * Only available on Android and iOS.
 */
export function useBluetoothLowEnergyDeviceScanned(
  callback: (event: DeviceScannedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(BluetoothLowEnergy, 'deviceScanned', callback, options);
}
