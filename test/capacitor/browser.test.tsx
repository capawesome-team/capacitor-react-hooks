import { Browser } from '@capacitor/browser';
import { act, renderHook } from '@testing-library/react';

import { useBrowser, useBrowserFinished, useBrowserPageLoaded } from '../../src/capacitor/browser';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/browser', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.open = vi.fn(async () => undefined);
  fake.plugin.close = vi.fn(async () => undefined);
  return { Browser: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Browser as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/browser', () => {
  it('useBrowserFinished delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBrowserFinished(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserFinished'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('browserFinished')).toBe(0);
  });

  it('useBrowserPageLoaded delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBrowserPageLoaded(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserPageLoaded'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('browserPageLoaded')).toBe(0);
  });

  it('useBrowser exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBrowser(), { wrapper: StrictModeWrapper });
    await act(() => result.current.open({ url: 'https://capawesome.io' }));
    expect(Browser.open).toHaveBeenCalledWith({ url: 'https://capawesome.io' });
    await act(() => result.current.close());
    expect(Browser.close).toHaveBeenCalled();
  });
});
