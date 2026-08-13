import { Compass } from '@capawesome/capacitor-compass';
import { act, renderHook } from '@testing-library/react';

import { useCompass, useCompassUpdates, useHeadingChange } from '../../src/capawesome/compass';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-compass', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getHeading = vi.fn(async () => ({
    accuracy: 15,
    magneticHeading: 149.6,
    trueHeading: 152.1,
  }));
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.startHeadingUpdates = vi.fn(async () => undefined);
  fake.plugin.stopHeadingUpdates = vi.fn(async () => undefined);
  return { Compass: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Compass as unknown as { __fake: FakePlugin }).__fake;
const startHeadingUpdates = vi.mocked(Compass.startHeadingUpdates);
const stopHeadingUpdates = vi.mocked(Compass.stopHeadingUpdates);

const flushMicrotasks = () => act(() => Promise.resolve());
const heading = { accuracy: 15, magneticHeading: 90, trueHeading: 92 };

describe('capawesome/compass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useHeadingChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useHeadingChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('headingChange', heading));
    expect(callback).toHaveBeenCalledExactlyOnceWith(heading);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('headingChange')).toBe(0);
  });

  it('useCompassUpdates starts the updates, delivers events and stops as often as it started', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useCompassUpdates(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startHeadingUpdates).toHaveBeenCalled();
    expect(fake.listenerCount('headingChange')).toBe(1);
    act(() => fake.emit('headingChange', heading));
    expect(callback).toHaveBeenCalledExactlyOnceWith(heading);

    unmount();
    await flushMicrotasks();
    expect(stopHeadingUpdates).toHaveBeenCalledTimes(startHeadingUpdates.mock.calls.length);
    expect(fake.listenerCount('headingChange')).toBe(0);
  });

  it('useCompassUpdates does not start the updates when disabled', async () => {
    renderHook(() => useCompassUpdates(vi.fn(), { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(startHeadingUpdates).not.toHaveBeenCalled();
    expect(fake.listenerCount('headingChange')).toBe(0);
  });

  it('useCompass exposes getHeading', async () => {
    const { result } = renderHook(() => useCompass(), { wrapper: StrictModeWrapper });
    await expect(result.current.getHeading()).resolves.toEqual({
      accuracy: 15,
      magneticHeading: 149.6,
      trueHeading: 152.1,
    });
  });
});
