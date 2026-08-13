import { Intercom } from '@capawesome/capacitor-intercom';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useIntercom,
  useIntercomMessengerHidden,
  useIntercomMessengerShown,
  useIntercomUnreadConversationCount,
  useIntercomUnreadConversationCountChange,
} from '../../src/capawesome/intercom';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-intercom', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getUnreadConversationCount = vi.fn(async () => ({ count: 2 }));
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.present = vi.fn(async () => undefined);
  return { Intercom: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Intercom as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/intercom', () => {
  it('useIntercom exposes the plugin methods', async () => {
    const { result } = renderHook(() => useIntercom(), { wrapper: StrictModeWrapper });
    await expect(result.current.getUnreadConversationCount()).resolves.toEqual({ count: 2 });
  });

  it('useIntercomUnreadConversationCount seeds from the getter and follows change events', async () => {
    const { result } = renderHook(() => useIntercomUnreadConversationCount(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toBe(2));
    act(() => fake.emit('unreadConversationCountChange', { count: 7 }));
    expect(result.current).toBe(7);
  });

  it('useIntercomUnreadConversationCountChange delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useIntercomUnreadConversationCountChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('unreadConversationCountChange', { count: 3 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ count: 3 });
    unmount();
    expect(fake.listenerCount('unreadConversationCountChange')).toBe(0);
  });

  it('registers a listener for every messenger event', async () => {
    const { unmount } = renderHook(
      () => {
        useIntercomMessengerHidden(vi.fn());
        useIntercomMessengerShown(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('messengerHidden')).toBe(1);
    expect(fake.listenerCount('messengerShown')).toBe(1);
    unmount();
    expect(fake.listenerCount('messengerShown')).toBe(0);
  });
});
