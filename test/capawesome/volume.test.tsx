import { Volume } from '@capawesome/capacitor-volume';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useVolume,
  useVolumeButtonPressed,
  useVolumeChange,
  useVolumeLevel,
} from '../../src/capawesome/volume';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-volume', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getVolume = vi.fn(async () => ({ volume: 0.5 }));
  fake.plugin.isWatching = vi.fn(async () => ({ watching: false }));
  fake.plugin.setVolume = vi.fn(async () => undefined);
  fake.plugin.startWatching = vi.fn(async () => undefined);
  fake.plugin.stopWatching = vi.fn(async () => undefined);
  return { Volume: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Volume as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/volume', () => {
  it('useVolumeLevel seeds from getVolume and follows change events', async () => {
    const { result } = renderHook(() => useVolumeLevel(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(0.5));
    act(() => fake.emit('volumeChange', { volume: 0.25 }));
    expect(result.current).toBe(0.25);
  });

  it('useVolumeChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useVolumeChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('volumeChange', { volume: 0.75 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ volume: 0.75 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('volumeChange')).toBe(0);
  });

  it('useVolumeButtonPressed delivers events', async () => {
    const callback = vi.fn();
    renderHook(() => useVolumeButtonPressed(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('volumeButtonPressed', { direction: 'up' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ direction: 'up' });
  });

  it('useVolume exposes getVolume', async () => {
    const { result } = renderHook(() => useVolume(), { wrapper: StrictModeWrapper });
    await expect(result.current.getVolume()).resolves.toEqual({ volume: 0.5 });
  });
});
