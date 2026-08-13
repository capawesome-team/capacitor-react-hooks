import { Motion } from '@capacitor/motion';
import { act, renderHook } from '@testing-library/react';

import { useMotionAccel, useMotionOrientation } from '../../src/capacitor/motion';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/motion', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  return { Motion: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Motion as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capacitor/motion', () => {
  it('useMotionAccel delivers acceleration events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useMotionAccel(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = {
      acceleration: { x: 0, y: 0, z: 9.8 },
      accelerationIncludingGravity: { x: 0, y: 0, z: 9.8 },
      rotationRate: { alpha: 0, beta: 0, gamma: 0 },
      interval: 16,
    };
    act(() => fake.emit('accel', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('accel')).toBe(0);
  });

  it('useMotionOrientation delivers orientation events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useMotionOrientation(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { alpha: 90, beta: 0, gamma: 0 };
    act(() => fake.emit('orientation', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('orientation')).toBe(0);
  });

  it('useMotionAccel detaches the listener when disabled', async () => {
    renderHook(() => useMotionAccel(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('accel')).toBe(0);
  });
});
