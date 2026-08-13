import { SilentMode } from '@capawesome/capacitor-silent-mode';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useIsSilent, useSilentMode, useSilentModeChange } from '../../src/capawesome/silent-mode';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-silent-mode', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isSilent = vi.fn(async () => ({ silent: false }));
  fake.plugin.getRingerMode = vi.fn(async () => ({ mode: 'normal' }));
  return { SilentMode: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (SilentMode as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/silent-mode', () => {
  it('useIsSilent seeds from isSilent and follows change events', async () => {
    const { result } = renderHook(() => useIsSilent(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(false));
    act(() => fake.emit('silentModeChange', { silent: true }));
    expect(result.current).toBe(true);
  });

  it('useSilentModeChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSilentModeChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('silentModeChange', { silent: true }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ silent: true });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('silentModeChange')).toBe(0);
  });

  it('useSilentMode exposes getRingerMode', async () => {
    const { result } = renderHook(() => useSilentMode(), { wrapper: StrictModeWrapper });
    await expect(result.current.getRingerMode()).resolves.toEqual({ mode: 'normal' });
  });
});
