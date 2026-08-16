import { BluetoothLowEnergy } from '@capawesome-team/capacitor-bluetooth-low-energy';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useBluetoothLowEnergy,
  useBluetoothLowEnergyCharacteristicChanged,
  useBluetoothLowEnergyConnectedDevices,
  useBluetoothLowEnergyPermissions,
  useBluetoothLowEnergyScanSession,
} from '../../src/capawesome/bluetooth-low-energy';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-bluetooth-low-energy', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.getConnectedDevices = vi.fn(async () => ({ devices: [{ id: '00:00:00:00:00:01' }] }));
  fake.plugin.startScan = vi.fn(async () => undefined);
  fake.plugin.stopScan = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ bluetoothScan: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ bluetoothScan: 'granted' }));
  return { BluetoothLowEnergy: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (BluetoothLowEnergy as unknown as { __fake: FakePlugin }).__fake;
const getConnectedDevices = vi.mocked(BluetoothLowEnergy.getConnectedDevices);
const startScan = vi.mocked(BluetoothLowEnergy.startScan);
const stopScan = vi.mocked(BluetoothLowEnergy.stopScan);

const flushMicrotasks = () => act(() => Promise.resolve());
const device = { id: '00:00:00:00:00:02', name: 'My Device', rssi: -50 };

describe('capawesome/bluetooth-low-energy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBluetoothLowEnergy exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBluetoothLowEnergy(), { wrapper: StrictModeWrapper });
    await expect(result.current.initialize()).resolves.toBeUndefined();
    expect(BluetoothLowEnergy.initialize).toHaveBeenCalled();
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true });
  });

  it('useBluetoothLowEnergyPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useBluetoothLowEnergyPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ bluetoothScan: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ bluetoothScan: 'granted' });
  });

  it('useBluetoothLowEnergyConnectedDevices reloads on connect and disconnect', async () => {
    const { result } = renderHook(() => useBluetoothLowEnergyConnectedDevices(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toEqual([{ id: '00:00:00:00:00:01' }]));

    getConnectedDevices.mockResolvedValue({ devices: [] });
    act(() => fake.emit('deviceDisconnected', { deviceId: '00:00:00:00:00:01' }));
    await waitFor(() => expect(result.current).toEqual([]));
  });

  it('useBluetoothLowEnergyScanSession starts scanning and collects scanned devices', async () => {
    const options = { allowDuplicates: true };
    const { result } = renderHook(() => useBluetoothLowEnergyScanSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('deviceScanned')).toBe(0);

    await act(() => result.current.start(options));
    await flushMicrotasks();
    expect(startScan).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isScanning).toBe(true);
    expect(fake.listenerCount('deviceScanned')).toBe(1);

    act(() => fake.emit('deviceScanned', device));
    expect(result.current.devices).toEqual([device]);
  });

  it('useBluetoothLowEnergyScanSession lists every device once with the latest data', async () => {
    const { result } = renderHook(() => useBluetoothLowEnergyScanSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    act(() => fake.emit('deviceScanned', device));
    act(() => fake.emit('deviceScanned', { ...device, rssi: -80 }));
    expect(result.current.devices).toEqual([{ ...device, rssi: -80 }]);
  });

  it('useBluetoothLowEnergyScanSession stops the scan and detaches the listener on stop', async () => {
    const { result } = renderHook(() => useBluetoothLowEnergyScanSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    await act(() => result.current.stop());
    await flushMicrotasks();
    expect(stopScan).toHaveBeenCalledOnce();
    expect(result.current.isScanning).toBe(false);
    expect(fake.listenerCount('deviceScanned')).toBe(0);
  });

  it('useBluetoothLowEnergyScanSession stops the scan on unmount', async () => {
    const { result, unmount } = renderHook(() => useBluetoothLowEnergyScanSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopScan).toHaveBeenCalledOnce();
    expect(fake.listenerCount('deviceScanned')).toBe(0);
  });

  it('useBluetoothLowEnergyScanSession does not stop a scan that was never started', async () => {
    const { unmount } = renderHook(() => useBluetoothLowEnergyScanSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopScan).not.toHaveBeenCalled();
  });

  it('useBluetoothLowEnergyCharacteristicChanged delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBluetoothLowEnergyCharacteristicChanged(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = {
      characteristicId: '00002a37-0000-1000-8000-00805f9b34fb',
      deviceId: '00:00:00:00:00:01',
      serviceId: '0000180d-0000-1000-8000-00805f9b34fb',
      value: [1, 2, 3],
    };
    act(() => fake.emit('characteristicChanged', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('characteristicChanged')).toBe(0);
  });
});
