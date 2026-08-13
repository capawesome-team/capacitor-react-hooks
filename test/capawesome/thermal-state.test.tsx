import { ThermalState } from '@capawesome/capacitor-thermal-state';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useThermalState,
  useThermalStateChange,
  useThermalStateValue,
} from '../../src/capawesome/thermal-state';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-thermal-state', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getThermalState = vi.fn(async () => ({ state: 'nominal' }));
  return { ThermalState: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ThermalState as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/thermal-state', () => {
  it('useThermalStateValue seeds from getThermalState and follows change events', async () => {
    const { result } = renderHook(() => useThermalStateValue(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe('nominal'));
    act(() => fake.emit('thermalStateChange', { state: 'serious' }));
    expect(result.current).toBe('serious');
  });

  it('useThermalStateChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useThermalStateChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('thermalStateChange', { state: 'critical' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ state: 'critical' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('thermalStateChange')).toBe(0);
  });

  it('useThermalState exposes getThermalState', async () => {
    const { result } = renderHook(() => useThermalState(), { wrapper: StrictModeWrapper });
    await expect(result.current.getThermalState()).resolves.toEqual({ state: 'nominal' });
  });
});
