import { InAppBrowser } from '@capacitor/inappbrowser';
import { act, renderHook } from '@testing-library/react';

import {
  useInAppBrowser,
  useInAppBrowserClosed,
  useInAppBrowserPageLoaded,
  useInAppBrowserPageNavigationCompleted,
} from '../../src/capacitor/inappbrowser';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/inappbrowser', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.openInExternalBrowser = vi.fn(async () => undefined);
  fake.plugin.close = vi.fn(async () => undefined);
  return { InAppBrowser: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (InAppBrowser as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/inappbrowser', () => {
  it('useInAppBrowserClosed delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInAppBrowserClosed(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserClosed'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('browserClosed')).toBe(0);
  });

  it('useInAppBrowserPageLoaded delivers the event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInAppBrowserPageLoaded(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserPageLoaded'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('browserPageLoaded')).toBe(0);
  });

  it('useInAppBrowserPageNavigationCompleted delivers the URL and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInAppBrowserPageNavigationCompleted(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserPageNavigationCompleted', { url: 'https://capawesome.io' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ url: 'https://capawesome.io' });
    unmount();
    expect(fake.listenerCount('browserPageNavigationCompleted')).toBe(0);
  });

  it('useInAppBrowser exposes the plugin methods', async () => {
    const { result } = renderHook(() => useInAppBrowser(), { wrapper: StrictModeWrapper });
    await act(() => result.current.openInExternalBrowser({ url: 'https://capawesome.io' }));
    expect(InAppBrowser.openInExternalBrowser).toHaveBeenCalledWith({
      url: 'https://capawesome.io',
    });
    await act(() => result.current.close());
    expect(InAppBrowser.close).toHaveBeenCalled();
  });
});
