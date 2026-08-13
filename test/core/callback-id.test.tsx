import { act, renderHook } from '@testing-library/react';

import { useCallbackIdSubscription } from '../../src/core';
import { StrictModeWrapper } from '../strict-mode';

const flushMicrotasks = () => act(() => Promise.resolve());

type Callback = (event: unknown, error: unknown) => void;

function createCallbackIdApi() {
  const subscriptions = new Map<string, Callback>();
  let nextId = 0;
  let resolveStart: (() => void) | undefined;
  const start = vi.fn((callback: Callback) => {
    const id = `cb-${++nextId}`;
    subscriptions.set(id, callback);
    return new Promise<string>(resolve => {
      resolveStart = () => resolve(id);
    });
  });
  const stop = vi.fn(async (id: string) => {
    subscriptions.delete(id);
  });
  return {
    start,
    stop,
    subscriptions,
    resolveStart: () => resolveStart?.(),
    emit: (event: unknown, error: unknown = null) => {
      subscriptions.forEach(callback => callback(event, error));
    },
  };
}

describe('useCallbackIdSubscription', () => {
  it('routes events and in-band errors to the right handlers', async () => {
    const api = createCallbackIdApi();
    const onEvent = vi.fn();
    const onError = vi.fn();
    renderHook(() => useCallbackIdSubscription(api.start, api.stop, onEvent, onError), {
      wrapper: StrictModeWrapper,
    });
    api.resolveStart();
    await flushMicrotasks();
    act(() => api.emit({ value: 1 }));
    act(() => api.emit(null, new Error('in-band')));
    expect(onEvent).toHaveBeenCalledExactlyOnceWith({ value: 1 });
    expect(onError).toHaveBeenCalledExactlyOnceWith(new Error('in-band'));
  });

  it('stops the subscription when unmounted before the callback id resolves', async () => {
    const api = createCallbackIdApi();
    const { unmount } = renderHook(() =>
      useCallbackIdSubscription(api.start, api.stop, vi.fn()),
    );
    unmount();
    api.resolveStart();
    await flushMicrotasks();
    expect(api.stop).toHaveBeenCalled();
    expect(api.subscriptions.size).toBe(0);
  });

  it('stops the subscription on unmount and ignores late events', async () => {
    const api = createCallbackIdApi();
    const onEvent = vi.fn();
    const { unmount } = renderHook(() => useCallbackIdSubscription(api.start, api.stop, onEvent));
    api.resolveStart();
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(api.subscriptions.size).toBe(0);
    expect(onEvent).not.toHaveBeenCalled();
  });
});
