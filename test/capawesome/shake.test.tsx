import { Shake } from '@capawesome/capacitor-shake';
import { act, renderHook } from '@testing-library/react';

import { useShake, useShakeDetected, useShakeUpdates } from '../../src/capawesome/shake';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-shake', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.startWatching = vi.fn(async () => undefined);
  fake.plugin.stopWatching = vi.fn(async () => undefined);
  return { Shake: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Shake as unknown as { __fake: FakePlugin }).__fake;
const startWatching = vi.mocked(Shake.startWatching);
const stopWatching = vi.mocked(Shake.stopWatching);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/shake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useShakeDetected delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useShakeDetected(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('shake'));
    expect(callback).toHaveBeenCalledOnce();

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('shake')).toBe(0);
  });

  it('useShakeUpdates starts watching, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useShakeUpdates(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startWatching).toHaveBeenCalled();
    expect(fake.listenerCount('shake')).toBe(1);
    act(() => fake.emit('shake'));
    expect(callback).toHaveBeenCalledOnce();

    unmount();
    await flushMicrotasks();
    expect(stopWatching).toHaveBeenCalledTimes(startWatching.mock.calls.length);
    expect(fake.listenerCount('shake')).toBe(0);
  });

  it('useShake exposes startWatching', async () => {
    const { result } = renderHook(() => useShake(), { wrapper: StrictModeWrapper });
    await result.current.startWatching({ sensitivity: 'light' });
    expect(startWatching).toHaveBeenCalledExactlyOnceWith({ sensitivity: 'light' });
  });
});
