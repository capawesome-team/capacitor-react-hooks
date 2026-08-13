import { Pixlive } from '@capawesome/capacitor-pixlive';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  usePixlive,
  usePixliveCodeRecognize,
  usePixliveEnterContext,
  usePixliveEventFromContent,
  usePixliveExitContext,
  usePixliveHideAnnotations,
  usePixlivePermissions,
  usePixlivePresentAnnotations,
  usePixliveRequireSync,
  usePixliveSyncProgress,
} from '../../src/capawesome/pixlive';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-pixlive', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.getContexts = vi.fn(async () => ({ contexts: [] }));
  fake.plugin.getVersion = vi.fn(async () => ({ version: '1.2.3' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ camera: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ camera: 'granted' }));
  return { Pixlive: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Pixlive as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/pixlive', () => {
  it('usePixlive exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePixlive(), { wrapper: StrictModeWrapper });
    await expect(result.current.getVersion()).resolves.toEqual({ version: '1.2.3' });
    await expect(result.current.getContexts()).resolves.toEqual({ contexts: [] });
  });

  it('usePixlivePermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => usePixlivePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ camera: 'granted' }));
  });

  it('usePixliveCodeRecognize delivers scanned codes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePixliveCodeRecognize(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { code: 'https://example.com', type: 'qrcode' };
    act(() => fake.emit('codeRecognize', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('codeRecognize')).toBe(0);
  });

  it('registers a listener for every AR and synchronization event', async () => {
    const { unmount } = renderHook(
      () => {
        usePixliveEnterContext(vi.fn());
        usePixliveExitContext(vi.fn());
        usePixlivePresentAnnotations(vi.fn());
        usePixliveHideAnnotations(vi.fn());
        usePixliveEventFromContent(vi.fn());
        usePixliveSyncProgress(vi.fn());
        usePixliveRequireSync(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    for (const event of [
      'enterContext',
      'exitContext',
      'presentAnnotations',
      'hideAnnotations',
      'eventFromContent',
      'syncProgress',
      'requireSync',
    ]) {
      expect(fake.listenerCount(event)).toBe(1);
    }
    unmount();
    expect(fake.listenerCount('requireSync')).toBe(0);
  });
});
