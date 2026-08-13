import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useLiveUpdate,
  useLiveUpdateDownloadBundleProgress,
  useLiveUpdateNextBundle,
  useLiveUpdateNextBundleSet,
  useLiveUpdateReloaded,
} from '../../src/capawesome/live-update';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-live-update', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getNextBundle = vi.fn(async () => ({ bundleId: '1.0.0' }));
  fake.plugin.getCurrentBundle = vi.fn(async () => ({ bundleId: '0.9.0' }));
  fake.plugin.sync = vi.fn(async () => ({ nextBundleId: '1.0.0' }));
  fake.plugin.ready = vi.fn(async () => ({
    currentBundleId: '1.0.0',
    previousBundleId: '0.9.0',
    rollback: false,
  }));
  return { LiveUpdate: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (LiveUpdate as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/live-update', () => {
  it('useLiveUpdate exposes the plugin methods', async () => {
    const { result } = renderHook(() => useLiveUpdate(), { wrapper: StrictModeWrapper });
    await expect(result.current.sync()).resolves.toEqual({ nextBundleId: '1.0.0' });
    expect(LiveUpdate.sync).toHaveBeenCalled();
    await expect(result.current.getCurrentBundle()).resolves.toEqual({ bundleId: '0.9.0' });
    await expect(result.current.ready()).resolves.toEqual({
      currentBundleId: '1.0.0',
      previousBundleId: '0.9.0',
      rollback: false,
    });
  });

  it('useLiveUpdateNextBundle seeds from getNextBundle and follows nextBundleSet', async () => {
    const { result } = renderHook(() => useLiveUpdateNextBundle(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toBe('1.0.0'));
    act(() => fake.emit('nextBundleSet', { bundleId: null }));
    expect(result.current).toBeNull();
  });

  it('useLiveUpdateDownloadBundleProgress delivers progress and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLiveUpdateDownloadBundleProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = {
      bundleId: '1.0.0',
      downloadedBytes: 512,
      progress: 0.5,
      totalBytes: 1024,
    };
    act(() => fake.emit('downloadBundleProgress', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('downloadBundleProgress')).toBe(0);
  });

  it('useLiveUpdateNextBundleSet delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLiveUpdateNextBundleSet(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('nextBundleSet', { bundleId: '2.0.0' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ bundleId: '2.0.0' });
    unmount();
    expect(fake.listenerCount('nextBundleSet')).toBe(0);
  });

  it('useLiveUpdateReloaded delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLiveUpdateReloaded(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('reloaded'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('reloaded')).toBe(0);
  });
});
