import { Crisp } from '@capawesome/capacitor-crisp';
import { act, renderHook } from '@testing-library/react';

import {
  useCrisp,
  useCrispChatClosed,
  useCrispChatOpened,
  useCrispMessageReceived,
  useCrispMessageSent,
  useCrispSessionLoaded,
} from '../../src/capawesome/crisp';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-crisp', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.configure = vi.fn(async () => undefined);
  fake.plugin.openChat = vi.fn(async () => undefined);
  fake.plugin.isCrispPushNotification = vi.fn(async () => ({ crisp: true }));
  return { Crisp: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Crisp as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/crisp', () => {
  it('useCrisp exposes the plugin methods', async () => {
    const { result } = renderHook(() => useCrisp(), { wrapper: StrictModeWrapper });
    await expect(result.current.isCrispPushNotification({ data: {} })).resolves.toEqual({
      crisp: true,
    });
    await result.current.openChat();
    expect(Crisp.openChat).toHaveBeenCalled();
  });

  it('useCrispMessageReceived delivers messages and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useCrispMessageReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('messageReceived', { content: 'Hello' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ content: 'Hello' });
    unmount();
    expect(fake.listenerCount('messageReceived')).toBe(0);
  });

  it('registers a listener for every chat event', async () => {
    const { unmount } = renderHook(
      () => {
        useCrispChatClosed(vi.fn());
        useCrispChatOpened(vi.fn());
        useCrispMessageSent(vi.fn());
        useCrispSessionLoaded(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('chatClosed')).toBe(1);
    expect(fake.listenerCount('chatOpened')).toBe(1);
    expect(fake.listenerCount('messageSent')).toBe(1);
    expect(fake.listenerCount('sessionLoaded')).toBe(1);
    unmount();
    expect(fake.listenerCount('sessionLoaded')).toBe(0);
  });
});
