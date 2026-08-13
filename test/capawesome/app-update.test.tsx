import { AppUpdate } from '@capawesome/capacitor-app-update';
import { act, renderHook } from '@testing-library/react';

import { useAppUpdate, useFlexibleUpdateStateChange } from '../../src/capawesome/app-update';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const appUpdateInfo = {
  currentVersionName: '1.0.0',
  currentVersionCode: '1',
  updateAvailability: 2,
};

vi.mock('@capawesome/capacitor-app-update', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAppUpdateInfo = vi.fn(async () => appUpdateInfo);
  fake.plugin.openAppStore = vi.fn(async () => undefined);
  fake.plugin.performImmediateUpdate = vi.fn(async () => ({ code: 0 }));
  fake.plugin.startFlexibleUpdate = vi.fn(async () => ({ code: 0 }));
  fake.plugin.completeFlexibleUpdate = vi.fn(async () => undefined);
  return { AppUpdate: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (AppUpdate as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/app-update', () => {
  it('useFlexibleUpdateStateChange delivers state changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFlexibleUpdateStateChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const state = { installStatus: 2, bytesDownloaded: 100, totalBytesToDownload: 200 };
    act(() => fake.emit('onFlexibleUpdateStateChange', state));
    expect(callback).toHaveBeenCalledExactlyOnceWith(state);
    unmount();
    expect(fake.listenerCount('onFlexibleUpdateStateChange')).toBe(0);
  });

  it('useAppUpdate exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppUpdate(), { wrapper: StrictModeWrapper });
    await expect(result.current.getAppUpdateInfo()).resolves.toEqual(appUpdateInfo);
    await expect(result.current.startFlexibleUpdate()).resolves.toEqual({ code: 0 });
    await expect(result.current.completeFlexibleUpdate()).resolves.toBeUndefined();
  });
});
