import { InAppBrowser } from '@capawesome/capacitor-in-app-browser';
import { act, renderHook } from '@testing-library/react';

import {
  useInAppBrowser,
  useInAppBrowserClosed,
  useInAppBrowserMessageReceived,
  useInAppBrowserNavigationCompleted,
  useInAppBrowserPageLoaded,
  useInAppBrowserUrlChanged,
} from '../../src/capawesome/in-app-browser';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-in-app-browser', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.openInWebView = vi.fn(async () => undefined);
  fake.plugin.close = vi.fn(async () => undefined);
  fake.plugin.getCookies = vi.fn(async () => ({ cookies: { session: 'abc' } }));
  return { InAppBrowser: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (InAppBrowser as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/in-app-browser', () => {
  it('useInAppBrowser exposes the plugin methods', async () => {
    const { result } = renderHook(() => useInAppBrowser(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.openInWebView({ url: 'https://capawesome.io' }),
    ).resolves.toBeUndefined();
    expect(InAppBrowser.openInWebView).toHaveBeenCalledWith({ url: 'https://capawesome.io' });
    await expect(result.current.getCookies({ url: 'https://capawesome.io' })).resolves.toEqual({
      cookies: { session: 'abc' },
    });
  });

  it('useInAppBrowserUrlChanged delivers url changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInAppBrowserUrlChanged(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('browserUrlChanged', { url: 'https://capawesome.io/docs' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ url: 'https://capawesome.io/docs' });
    unmount();
    expect(fake.listenerCount('browserUrlChanged')).toBe(0);
  });

  it('delivers the remaining browser events', async () => {
    const onClosed = vi.fn();
    const onMessageReceived = vi.fn();
    const onNavigationCompleted = vi.fn();
    const onPageLoaded = vi.fn();
    const { unmount } = renderHook(
      () => {
        useInAppBrowserClosed(onClosed);
        useInAppBrowserMessageReceived(onMessageReceived);
        useInAppBrowserNavigationCompleted(onNavigationCompleted);
        useInAppBrowserPageLoaded(onPageLoaded);
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    act(() => {
      fake.emit('browserClosed');
      fake.emit('browserMessageReceived', { data: { type: 'hello' } });
      fake.emit('browserNavigationCompleted', { url: 'https://capawesome.io' });
      fake.emit('browserPageLoaded');
    });
    expect(onClosed).toHaveBeenCalledOnce();
    expect(onMessageReceived).toHaveBeenCalledExactlyOnceWith({ data: { type: 'hello' } });
    expect(onNavigationCompleted).toHaveBeenCalledExactlyOnceWith({ url: 'https://capawesome.io' });
    expect(onPageLoaded).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('browserClosed')).toBe(0);
    expect(fake.listenerCount('browserMessageReceived')).toBe(0);
    expect(fake.listenerCount('browserNavigationCompleted')).toBe(0);
    expect(fake.listenerCount('browserPageLoaded')).toBe(0);
  });
});
