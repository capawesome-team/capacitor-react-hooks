import { act, renderHook } from '@testing-library/react';

import { captureLaunchEvents, usePluginListener } from '../../src/core';
import { createFakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const flushMicrotasks = () => act(() => Promise.resolve());

describe('captureLaunchEvents', () => {
  it('buffers events fired before mount and delivers them exactly once', async () => {
    const fake = createFakePlugin();
    captureLaunchEvents([{ plugin: fake.plugin, event: 'actionPerformed' }]);
    await flushMicrotasks();
    fake.emit('actionPerformed', { actionId: 'tap' });

    const callback = vi.fn();
    renderHook(() => usePluginListener(fake.plugin, 'actionPerformed', callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledExactlyOnceWith({ actionId: 'tap' });

    act(() => fake.emit('actionPerformed', { actionId: 'live' }));
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith({ actionId: 'live' });
  });

  it('does not replay drained events to later subscribers', async () => {
    const fake = createFakePlugin();
    captureLaunchEvents([{ plugin: fake.plugin, event: 'actionPerformed' }]);
    await flushMicrotasks();
    fake.emit('actionPerformed', { actionId: 'tap' });

    const first = renderHook(() => usePluginListener(fake.plugin, 'actionPerformed', vi.fn()));
    await flushMicrotasks();
    first.unmount();

    const callback = vi.fn();
    renderHook(() => usePluginListener(fake.plugin, 'actionPerformed', callback));
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();
  });

  it('registers only one capture listener per plugin event', async () => {
    const fake = createFakePlugin();
    captureLaunchEvents([{ plugin: fake.plugin, event: 'event' }]);
    captureLaunchEvents([{ plugin: fake.plugin, event: 'event' }]);
    await flushMicrotasks();
    expect(fake.listenerCount('event')).toBe(1);
  });
});
