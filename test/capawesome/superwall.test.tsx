import { Superwall } from '@capawesome/capacitor-superwall';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useSuperwall,
  useSuperwallCustomPaywallAction,
  useSuperwallEvent,
  useSuperwallPaywallDismissed,
  useSuperwallPaywallPresented,
  useSuperwallPaywallWillDismiss,
  useSuperwallSubscriptionStatus,
  useSuperwallSubscriptionStatusDidChange,
} from '../../src/capawesome/superwall';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-superwall', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.configure = vi.fn(async () => undefined);
  fake.plugin.getSubscriptionStatus = vi.fn(async () => ({ status: 'INACTIVE' }));
  fake.plugin.getUserId = vi.fn(async () => ({ userId: 'user-1' }));
  fake.plugin.register = vi.fn(async () => ({ result: 'PURCHASED' }));
  return { Superwall: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Superwall as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/superwall', () => {
  it('useSuperwall exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSuperwall(), { wrapper: StrictModeWrapper });
    await expect(result.current.getUserId()).resolves.toEqual({ userId: 'user-1' });
    await expect(result.current.register({ placement: 'campaign_trigger' })).resolves.toEqual({
      result: 'PURCHASED',
    });
  });

  it('useSuperwallSubscriptionStatus seeds from the getter and follows change events', async () => {
    const { result } = renderHook(() => useSuperwallSubscriptionStatus(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toBe('INACTIVE'));
    act(() => fake.emit('subscriptionStatusDidChange', { status: 'ACTIVE' }));
    expect(result.current).toBe('ACTIVE');
  });

  it('useSuperwallEvent delivers analytics events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSuperwallEvent(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { event: { type: 'paywallOpen' } };
    act(() => fake.emit('superwallEvent', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('superwallEvent')).toBe(0);
  });

  it('registers a listener for every paywall event', async () => {
    const { unmount } = renderHook(
      () => {
        useSuperwallSubscriptionStatusDidChange(vi.fn());
        useSuperwallPaywallPresented(vi.fn());
        useSuperwallPaywallWillDismiss(vi.fn());
        useSuperwallPaywallDismissed(vi.fn());
        useSuperwallCustomPaywallAction(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('subscriptionStatusDidChange')).toBe(1);
    expect(fake.listenerCount('paywallPresented')).toBe(1);
    expect(fake.listenerCount('paywallWillDismiss')).toBe(1);
    expect(fake.listenerCount('paywallDismissed')).toBe(1);
    expect(fake.listenerCount('customPaywallAction')).toBe(1);
    unmount();
    expect(fake.listenerCount('customPaywallAction')).toBe(0);
  });
});
