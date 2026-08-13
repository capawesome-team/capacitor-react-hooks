import { ScreenOrientation } from '@capacitor/screen-orientation';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useScreenOrientation,
  useScreenOrientationChange,
  useScreenOrientationType,
} from '../../src/capacitor/screen-orientation';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/screen-orientation', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.orientation = vi.fn(async () => ({ type: 'portrait-primary' }));
  fake.plugin.lock = vi.fn(async () => undefined);
  fake.plugin.unlock = vi.fn(async () => undefined);
  return { ScreenOrientation: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ScreenOrientation as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/screen-orientation', () => {
  it('useScreenOrientationType seeds from orientation and follows change events', async () => {
    const { result } = renderHook(() => useScreenOrientationType(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toEqual({ type: 'portrait-primary' }));
    act(() => fake.emit('screenOrientationChange', { type: 'landscape-primary' }));
    expect(result.current).toEqual({ type: 'landscape-primary' });
  });

  it('useScreenOrientationChange delivers change events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useScreenOrientationChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('screenOrientationChange', { type: 'landscape-secondary' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ type: 'landscape-secondary' });
    unmount();
    expect(fake.listenerCount('screenOrientationChange')).toBe(0);
  });

  it('useScreenOrientation exposes the plugin methods', async () => {
    const { result } = renderHook(() => useScreenOrientation(), { wrapper: StrictModeWrapper });
    await expect(result.current.orientation()).resolves.toEqual({ type: 'portrait-primary' });
    await expect(result.current.lock({ orientation: 'portrait' })).resolves.toBeUndefined();
    await expect(result.current.unlock()).resolves.toBeUndefined();
  });
});
