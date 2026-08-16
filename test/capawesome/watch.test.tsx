import { Watch } from '@capawesome-team/capacitor-watch';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useWatch,
  useWatchConnectionInfo,
  useWatchMessageReceived,
  useWatchReceivedState,
} from '../../src/capawesome/watch';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-watch', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getConnectionInfo = vi.fn(async () => ({
    paired: true,
    reachable: false,
    watchAppInstalled: true,
  }));
  fake.plugin.getReceivedState = vi.fn(async () => ({ data: { count: 1 } }));
  fake.plugin.sendMessage = vi.fn(async () => ({ reply: { ok: true } }));
  return { Watch: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Watch as unknown as { __fake: FakePlugin }).__fake;
const getConnectionInfo = vi.mocked(Watch.getConnectionInfo);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/watch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useWatch exposes the plugin methods', async () => {
    const { result } = renderHook(() => useWatch(), { wrapper: StrictModeWrapper });
    await expect(result.current.sendMessage({ data: { ping: true } })).resolves.toEqual({
      reply: { ok: true },
    });
    expect(Watch.sendMessage).toHaveBeenCalledExactlyOnceWith({ data: { ping: true } });
  });

  it('useWatchConnectionInfo reloads whenever the reachability changes', async () => {
    const { result } = renderHook(() => useWatchConnectionInfo(), { wrapper: StrictModeWrapper });
    await waitFor(() =>
      expect(result.current).toEqual({ paired: true, reachable: false, watchAppInstalled: true }),
    );

    getConnectionInfo.mockResolvedValue({ paired: true, reachable: true, watchAppInstalled: true });
    act(() => fake.emit('reachabilityChange', { reachable: true }));
    await waitFor(() =>
      expect(result.current).toEqual({ paired: true, reachable: true, watchAppInstalled: true }),
    );
  });

  it('useWatchReceivedState starts with the persisted state and follows the events', async () => {
    const { result } = renderHook(() => useWatchReceivedState(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toEqual({ count: 1 }));

    act(() => fake.emit('stateReceived', { data: { count: 2 } }));
    expect(result.current).toEqual({ count: 2 });
  });

  it('useWatchMessageReceived delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useWatchMessageReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { data: { text: 'Hello' }, messageId: 'message-1' };
    act(() => fake.emit('messageReceived', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('messageReceived')).toBe(0);
  });
});
