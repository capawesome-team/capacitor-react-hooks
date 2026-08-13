import { ScreenReader } from '@capacitor/screen-reader';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useScreenReader,
  useScreenReaderEnabled,
  useScreenReaderStateChange,
} from '../../src/capacitor/screen-reader';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/screen-reader', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isEnabled = vi.fn(async () => ({ value: true }));
  fake.plugin.speak = vi.fn(async () => undefined);
  return { ScreenReader: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ScreenReader as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/screen-reader', () => {
  it('useScreenReaderEnabled seeds from isEnabled and follows state change events', async () => {
    const { result } = renderHook(() => useScreenReaderEnabled(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(true));
    act(() => fake.emit('stateChange', { value: false }));
    expect(result.current).toBe(false);
  });

  it('useScreenReaderStateChange delivers state changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useScreenReaderStateChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('stateChange', { value: true }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ value: true });
    unmount();
    expect(fake.listenerCount('stateChange')).toBe(0);
  });

  it('useScreenReader exposes the plugin methods', async () => {
    const { result } = renderHook(() => useScreenReader(), { wrapper: StrictModeWrapper });
    await expect(result.current.isEnabled()).resolves.toEqual({ value: true });
    await expect(result.current.speak({ value: 'Hello' })).resolves.toBeUndefined();
  });
});
