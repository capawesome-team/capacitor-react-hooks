import { act, renderHook } from '@testing-library/react';

import { usePluginListener } from '../../src/core';
import { createFakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const flushMicrotasks = () => act(() => Promise.resolve());

describe('usePluginListener', () => {
  it('delivers events to the callback', async () => {
    const fake = createFakePlugin();
    const callback = vi.fn();
    renderHook(() => usePluginListener(fake.plugin, 'event', callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('event', { value: 1 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ value: 1 });
  });

  it('keeps exactly one active listener under StrictMode and removes it on unmount', async () => {
    const fake = createFakePlugin();
    const { unmount } = renderHook(() => usePluginListener(fake.plugin, 'event', vi.fn()), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(1);
    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(0);
  });

  it('removes the listener when unmounted before the handle resolves', async () => {
    const fake = createFakePlugin({ deferHandles: true });
    const { unmount } = renderHook(() => usePluginListener(fake.plugin, 'event', vi.fn()));
    unmount();
    fake.flushHandles();
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(0);
  });

  it('always invokes the latest callback without resubscribing', async () => {
    const fake = createFakePlugin();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => usePluginListener(fake.plugin, 'event', callback),
      { initialProps: { callback: first } },
    );
    await flushMicrotasks();
    rerender({ callback: second });
    act(() => fake.emit('event', 'payload'));
    expect(fake.plugin.addListener).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith('payload');
  });

  it('does not subscribe while disabled and subscribes once enabled', async () => {
    const fake = createFakePlugin();
    const { rerender } = renderHook(
      ({ enabled }) => usePluginListener(fake.plugin, 'event', vi.fn(), { enabled }),
      { initialProps: { enabled: false } },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(0);
    rerender({ enabled: true });
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(1);
  });
});
