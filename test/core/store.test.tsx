import { act, renderHook } from '@testing-library/react';

import { createPluginStateHook, pluginEventSubscription } from '../../src/core';
import { createFakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const flushMicrotasks = () => act(() => Promise.resolve());

describe('createPluginStateHook', () => {
  it('seeds from load and updates on events', async () => {
    const fake = createFakePlugin();
    const useValue = createPluginStateHook<string>({
      load: async () => 'initial',
      subscribe: pluginEventSubscription(fake.plugin, 'change'),
    });
    const { result } = renderHook(() => useValue(), { wrapper: StrictModeWrapper });
    expect(result.current).toBeUndefined();
    await flushMicrotasks();
    expect(result.current).toBe('initial');
    act(() => fake.emit('change', 'updated'));
    expect(result.current).toBe('updated');
  });

  it('shares one plugin listener across components and tears down after the last unmount', async () => {
    const fake = createFakePlugin();
    const useValue = createPluginStateHook<string>({
      subscribe: pluginEventSubscription(fake.plugin, 'change'),
    });
    const first = renderHook(() => useValue());
    const second = renderHook(() => useValue());
    await flushMicrotasks();
    expect(fake.listenerCount('change')).toBe(1);
    act(() => fake.emit('change', 'shared'));
    expect(first.result.current).toBe('shared');
    expect(second.result.current).toBe('shared');
    first.unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('change')).toBe(1);
    second.unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('change')).toBe(0);
  });

  it('does not let a slow load overwrite a newer event value', async () => {
    const fake = createFakePlugin();
    let resolveLoad: ((value: string) => void) | undefined;
    const useValue = createPluginStateHook<string>({
      load: () =>
        new Promise<string>(resolve => {
          resolveLoad = resolve;
        }),
      subscribe: pluginEventSubscription(fake.plugin, 'change'),
    });
    const { result } = renderHook(() => useValue());
    await flushMicrotasks();
    act(() => fake.emit('change', 'from-event'));
    await act(async () => {
      resolveLoad?.('stale-load');
    });
    expect(result.current).toBe('from-event');
  });

  it('resubscribes when a component mounts again after teardown', async () => {
    const fake = createFakePlugin();
    const useValue = createPluginStateHook<string>({
      subscribe: pluginEventSubscription(fake.plugin, 'change'),
    });
    const first = renderHook(() => useValue());
    await flushMicrotasks();
    first.unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('change')).toBe(0);
    const second = renderHook(() => useValue());
    await flushMicrotasks();
    expect(fake.listenerCount('change')).toBe(1);
    act(() => fake.emit('change', 'again'));
    expect(second.result.current).toBe('again');
  });
});
