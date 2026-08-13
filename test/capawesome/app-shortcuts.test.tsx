import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import { act, renderHook } from '@testing-library/react';

import { useAppShortcutClick, useAppShortcuts } from '../../src/capawesome/app-shortcuts';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-shortcuts', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.get = vi.fn(async () => ({ shortcuts: [{ id: 'feedback', title: 'Feedback' }] }));
  fake.plugin.set = vi.fn(async () => undefined);
  fake.plugin.clear = vi.fn(async () => undefined);
  return { AppShortcuts: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (AppShortcuts as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/app-shortcuts', () => {
  it('useAppShortcutClick delivers click events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAppShortcutClick(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('click', { shortcutId: 'feedback' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ shortcutId: 'feedback' });
    unmount();
    expect(fake.listenerCount('click')).toBe(0);
  });

  it('useAppShortcuts exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppShortcuts(), { wrapper: StrictModeWrapper });
    await expect(result.current.get()).resolves.toEqual({
      shortcuts: [{ id: 'feedback', title: 'Feedback' }],
    });
    await expect(result.current.set({ shortcuts: [] })).resolves.toBeUndefined();
    await expect(result.current.clear()).resolves.toBeUndefined();
  });
});
