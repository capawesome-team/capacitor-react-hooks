import { Admob } from '@capawesome-team/capacitor-admob';
import { act, renderHook } from '@testing-library/react';

import { useAdmob, useAdmobAdLoaded, useAdmobRewardEarned } from '../../src/capawesome/admob';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-admob', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.requestConsent = vi.fn(async () => ({
    canRequestAds: true,
    privacyOptionsRequired: false,
    status: 'obtained',
  }));
  fake.plugin.showBanner = vi.fn(async () => ({ id: 'banner-1' }));
  return { Admob: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Admob as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/admob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAdmob exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAdmob(), { wrapper: StrictModeWrapper });
    await expect(result.current.initialize()).resolves.toBeUndefined();
    expect(Admob.initialize).toHaveBeenCalled();
    await expect(result.current.requestConsent()).resolves.toEqual({
      canRequestAds: true,
      privacyOptionsRequired: false,
      status: 'obtained',
    });
    await expect(result.current.showBanner({ adUnitId: 'ca-app-pub-x/y' })).resolves.toEqual({
      id: 'banner-1',
    });
  });

  it('useAdmobAdLoaded delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAdmobAdLoaded(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { format: 'BANNER', id: 'banner-1' };
    act(() => fake.emit('adLoaded', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('adLoaded')).toBe(0);
  });

  it('useAdmobRewardEarned delivers events', async () => {
    const callback = vi.fn();
    renderHook(() => useAdmobRewardEarned(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    const event = { amount: 10, id: 'rewarded-1', type: 'coins' };
    act(() => fake.emit('rewardEarned', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
  });

  it('useAdmobAdLoaded does not attach the listener when disabled', async () => {
    renderHook(() => useAdmobAdLoaded(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('adLoaded')).toBe(0);
  });
});
