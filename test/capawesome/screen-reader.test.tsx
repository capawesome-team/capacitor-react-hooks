import { ScreenReader } from '@capawesome/capacitor-screen-reader';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useScreenReader,
  useScreenReaderEnabled,
  useScreenReaderStateChange,
} from '../../src/capawesome/screen-reader';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-screen-reader', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.announce = vi.fn(async () => undefined);
  fake.plugin.isEnabled = vi.fn(async () => ({ enabled: true }));
  return { ScreenReader: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ScreenReader as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/screen-reader', () => {
  it('useScreenReaderEnabled seeds from isEnabled and follows state change events', async () => {
    const { result } = renderHook(() => useScreenReaderEnabled(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(true));
    act(() => fake.emit('stateChange', { enabled: false }));
    expect(result.current).toBe(false);
  });

  it('useScreenReaderStateChange delivers state changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useScreenReaderStateChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('stateChange', { enabled: true }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ enabled: true });
    unmount();
    expect(fake.listenerCount('stateChange')).toBe(0);
  });

  it('useScreenReader exposes the plugin methods', async () => {
    const { result } = renderHook(() => useScreenReader(), { wrapper: StrictModeWrapper });
    await expect(result.current.announce({ value: 'Item added' })).resolves.toBeUndefined();
    expect(ScreenReader.announce).toHaveBeenCalledWith({ value: 'Item added' });
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: true });
  });
});
